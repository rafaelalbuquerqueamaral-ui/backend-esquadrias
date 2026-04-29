const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
  app.get("/", (req, res) => {
  res.send("Backend PostgreSQL rodando 🚀");
});

app.get("/teste-db", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as agora");
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

/* FACHADAS */

app.get("/fachadas", async (req, res) => {
  const r = await pool.query(`
    SELECT 
      id,
      nome,
      obra_id AS "obraId",
      largura_total AS "larguraTotal",
      altura_total AS "alturaTotal",
      colunas,
      linhas,
      larguras_colunas AS "largurasColunas",
      alturas_linhas AS "alturasLinhas",
      modulos
    FROM fachadas
    ORDER BY id DESC
  `);

  res.json(r.rows);
});

app.get("/fachadas/:id", async (req, res) => {
  const r = await pool.query(
    `
    SELECT 
      id,
      nome,
      obra_id AS "obraId",
      largura_total AS "larguraTotal",
      altura_total AS "alturaTotal",
      colunas,
      linhas,
      larguras_colunas AS "largurasColunas",
      alturas_linhas AS "alturasLinhas",
      modulos
    FROM fachadas
    WHERE id = $1
    `,
    [req.params.id]
  );

  if (r.rows.length === 0) {
    return res.status(404).json({ erro: "Fachada não encontrada" });
  }

  res.json(r.rows[0]);
});

app.post("/fachadas", async (req, res) => {
  const f = req.body;

  const r = await pool.query(
    `
    INSERT INTO fachadas
    (nome, obra_id, largura_total, altura_total, colunas, linhas, larguras_colunas, alturas_linhas, modulos)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING 
      id,
      nome,
      obra_id AS "obraId",
      largura_total AS "larguraTotal",
      altura_total AS "alturaTotal",
      colunas,
      linhas,
      larguras_colunas AS "largurasColunas",
      alturas_linhas AS "alturasLinhas",
      modulos
    `,
    [
      f.nome || "Fachada Nova",
      Number(f.obraId || 0),
      Number(f.larguraTotal || 3000),
      Number(f.alturaTotal || 3000),
      Number(f.colunas || 3),
      Number(f.linhas || 3),
      JSON.stringify(f.largurasColunas || []),
      JSON.stringify(f.alturasLinhas || []),
      JSON.stringify(f.modulos || {}),
    ]
  );

  res.status(201).json(r.rows[0]);
});

app.delete("/fachadas/:id", async (req, res) => {
  await pool.query("DELETE FROM fachadas WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

/* COMPOSIÇÃO */

app.get("/fachadas/:id/composicao", async (req, res) => {
  const r = await pool.query(
    `
    SELECT 
      id,
      fachada_id AS "fachadaId",
      tipo_modulo AS "tipoModulo",
      categoria,
      material_nome AS "materialNome",
      unidade,
      funcao,
      formula,
      formula_repeticoes AS "formulaRepeticoes",
      valor_unitario AS "valorUnitario"
    FROM fachada_composicoes
    WHERE fachada_id=$1
    ORDER BY id DESC
    `,
    [req.params.id]
  );

  res.json(r.rows);
});

app.post("/fachadas/:id/composicao", async (req, res) => {
  const c = req.body;

  const r = await pool.query(
    `
    INSERT INTO fachada_composicoes
    (fachada_id, tipo_modulo, categoria, material_nome, unidade, funcao, formula, formula_repeticoes, valor_unitario)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
    `,
    [
      req.params.id,
      c.tipoModulo || "fixo",
      c.categoria || "perfil",
      c.materialNome || "",
      c.unidade || "un",
      c.funcao || "",
      c.formula || "1",
      c.formulaRepeticoes || "1",
      Number(c.valorUnitario || 0),
    ]
  );

  res.status(201).json(r.rows[0]);
});

app.delete("/fachadas/composicao/:id", async (req, res) => {
  await pool.query("DELETE FROM fachada_composicoes WHERE id=$1", [
    req.params.id,
  ]);

  res.json({ ok: true });
});

/* ORÇAMENTOS */

function calcularFormula(formula, largura, altura) {
  try {
    const expr = String(formula || "1")
      .replaceAll("largura", `(${Number(largura)})`)
      .replaceAll("altura", `(${Number(altura)})`);

    return Number(Function(`"use strict"; return (${expr})`)() || 0);
  } catch {
    return 0;
  }
}

app.post("/fachadas/:id/orcamento-completo", async (req, res) => {
  const fachadaRes = await pool.query("SELECT * FROM fachadas WHERE id=$1", [
    req.params.id,
  ]);

  if (fachadaRes.rows.length === 0) {
    return res.status(404).json({ erro: "Fachada não encontrada" });
  }

  const f = fachadaRes.rows[0];

  const compRes = await pool.query(
    "SELECT * FROM fachada_composicoes WHERE fachada_id=$1",
    [req.params.id]
  );

  if (compRes.rows.length === 0) {
    return res.status(400).json({ erro: "Fachada sem composição técnica" });
  }

  const largura = Number(f.largura_total || 3000);
  const altura = Number(f.altura_total || 3000);

  const itens = compRes.rows.map((c) => {
    const base = calcularFormula(c.formula, largura, altura);
    const rep = calcularFormula(c.formula_repeticoes, largura, altura);

    let quantidade = rep;

    if (c.unidade === "m" || c.unidade === "m2") {
      quantidade = base * rep;
    }

    const valorUnitario = Number(c.valor_unitario || 0);
    const subtotal = quantidade * valorUnitario;

    return {
      categoria: c.categoria,
      materialNome: c.material_nome,
      unidade: c.unidade,
      quantidade,
      valorUnitario,
      subtotal,
      formula: c.formula,
      origem: "fachada inteira",
    };
  });

  const custo = itens.reduce((s, i) => s + Number(i.subtotal || 0), 0);
  const lucro = custo * 0.3;
  const total = custo + lucro;

  const detalhes = {
    custoMateriais: custo,
    margemLucro: lucro,
    valorVenda: total,
  };

  const orc = await pool.query(
    `
    INSERT INTO orcamentos
    (cliente, obra_nome, tipo, fachada_id, largura, altura, valor, itens, detalhes, desenho_fachada)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
    `,
    [
      "Cliente não informado",
      f.nome || "Fachada",
      "fachada",
      f.id,
      largura,
      altura,
      total,
      JSON.stringify(itens),
      JSON.stringify(detalhes),
      JSON.stringify(f),
    ]
  );

  res.status(201).json({
    id: orc.rows[0].id,
    cliente: orc.rows[0].cliente,
    obraNome: orc.rows[0].obra_nome,
    tipo: orc.rows[0].tipo,
    fachadaId: orc.rows[0].fachada_id,
    largura: orc.rows[0].largura,
    altura: orc.rows[0].altura,
    valor: orc.rows[0].valor,
    itens,
    detalhes,
    desenhoFachada: f,
  });
});

app.get("/orcamentos", async (req, res) => {
  const r = await pool.query("SELECT * FROM orcamentos ORDER BY id DESC");
  res.json(r.rows);
});

app.get("/orcamentos/:id", async (req, res) => {
  const r = await pool.query("SELECT * FROM orcamentos WHERE id=$1", [
    req.params.id,
  ]);

  if (r.rows.length === 0) {
    return res.status(404).json({ erro: "Orçamento não encontrado" });
  }

  const o = r.rows[0];

  res.json({
    id: o.id,
    cliente: o.cliente,
    obraNome: o.obra_nome,
    tipo: o.tipo,
    fachadaId: o.fachada_id,
    largura: o.largura,
    altura: o.altura,
    valor: o.valor,
    itens: o.itens || [],
    detalhes: o.detalhes || {},
    desenhoFachada: o.desenho_fachada || {},
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});