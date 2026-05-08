const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const pool = require("./db");
const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://SEU-FRONTEND.vercel.app"
  ],
  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE"
  ],
  credentials: true
}));
app.use(express.json());
// ======================================
// UPLOAD DE IMAGENS
// ======================================

app.use("/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, "uploads/");

  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() +
      "-" +
      file.originalname
    );

  }

});

const upload = multer({
  storage
});

// ======================================
// BIBLIOTECA INDUSTRIAL
// ======================================

const biblioteca = {

  perfis: [
    {
      id: 1,
      codigo: "SUP-001",
      nome: "Perfil Suprema Vertical",
      linha: "Suprema",
      valor: 45,
      imagem:
        "http://localhost:3001/uploads/perfil1.png"
    }
  ],

  vidros: [
    {
      id: 1,
      codigo: "VD-001",
      nome: "Vidro Temperado 8mm",
      valor: 120,
      imagem:
        "http://localhost:3001/uploads/vidro1.png"
    }
  ],

  acessorios: [
  {
    id: 1,
    codigo: "1125",
    nome: "Acessório 1125",
    valor: 35,
    imagem: "http://localhost:3001/uploads/acessorio1.png"
  }
]
};
// ======================================
// ROTAS
// ======================================

app.get("/api/biblioteca", (req, res) => {

  const tipo = req.query.tipo || "perfis";

  if (!biblioteca[tipo]) {

    return res.status(404).json({
      erro: "Tipo não encontrado"
    });

  }

  res.json(biblioteca[tipo]);
});


// ======================================

const PORT = 3001;
app.post(
  "/api/upload",
  upload.single("imagem"),
  (req, res) => {

    res.json({
      imagem:
        `http://localhost:3001/uploads/${req.file.filename}`
    });

  }
);
// ======================================
// CRIAR TABELAS ERP
// ======================================

app.get("/api/criar-tabelas", async (req, res) => {

  try {

    // ==================================
    // CLIENTES
    // ==================================

    await pool.query(`

      CREATE TABLE IF NOT EXISTS clientes (

        id SERIAL PRIMARY KEY,

        nome TEXT,

        telefone TEXT,

        email TEXT,

        cidade TEXT,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);


    // ==================================
    // OBRAS
    // ==================================

    await pool.query(`

      CREATE TABLE IF NOT EXISTS obras (

        id SERIAL PRIMARY KEY,

        cliente TEXT,

        nome TEXT,

        endereco TEXT,

        cidade TEXT,

        status TEXT,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);


    // ==================================
    // TIPOLOGIAS
    // ==================================

    await pool.query(`

      CREATE TABLE IF NOT EXISTS tipologias (

        id SERIAL PRIMARY KEY,

        nome TEXT,

        linha TEXT,

        largura INTEGER,

        altura INTEGER,

        observacao TEXT,

        imagem TEXT,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);


    // ==================================
    // PERFIS
    // ==================================

    await pool.query(`

      CREATE TABLE IF NOT EXISTS perfis (

        id SERIAL PRIMARY KEY,

        codigo TEXT,

        nome TEXT,

        linha TEXT,

        peso NUMERIC,

        valor NUMERIC,

        imagem TEXT,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);


    // ==================================
    // VIDROS
    // ==================================

    await pool.query(`

      CREATE TABLE IF NOT EXISTS vidros (

        id SERIAL PRIMARY KEY,

        nome TEXT,

        espessura TEXT,

        valor NUMERIC,

        imagem TEXT,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);


    // ==================================
    // ACESSORIOS
    // ==================================

    await pool.query(`

      CREATE TABLE IF NOT EXISTS acessorios (

        id SERIAL PRIMARY KEY,

        codigo TEXT,

        nome TEXT,

        valor NUMERIC,

        imagem TEXT,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);


    // ==================================
    // ORÇAMENTOS
    // ==================================

    await pool.query(`

      CREATE TABLE IF NOT EXISTS orcamentos (

        id SERIAL PRIMARY KEY,

        cliente TEXT,

        obra TEXT,

        valor_total NUMERIC,

        dados JSONB,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);


    // ==================================
    // PRODUÇÃO
    // ==================================

    await pool.query(`

      CREATE TABLE IF NOT EXISTS producao (

        id SERIAL PRIMARY KEY,

        obra TEXT,

        status TEXT,

        dados JSONB,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);


    // ==================================
    // FINANCEIRO
    // ==================================

    await pool.query(`

      CREATE TABLE IF NOT EXISTS financeiro (

        id SERIAL PRIMARY KEY,

        descricao TEXT,

        tipo TEXT,

        categoria TEXT,

        valor NUMERIC,

        status TEXT,

        created_at TIMESTAMP DEFAULT NOW()

      )

    `);


    res.json({

      ok: true,

      mensagem:
        "Tabelas ERP criadas"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json(error);

  }

});
// ======================================
// TIPOLOGIAS
// ======================================


// ======================================
// LISTAR
// ======================================

app.get("/api/tipologias", async (req, res) => {

  try {

    const resultado =
      await pool.query(`
        SELECT *
        FROM tipologias
        ORDER BY id DESC
      `);

    res.json(
      resultado.rows
    );

  } catch (error) {

    console.log(error);

    res.status(500).json(error);

  }

});


// ======================================
// SALVAR
// ======================================

app.post("/api/tipologias", async (req, res) => {

  try {

    const {

      nome,
      linha,
      largura,
      altura,
      observacao,
      imagem

    } = req.body;


    const resultado =
      await pool.query(

        `
        INSERT INTO tipologias
        (
          nome,
          linha,
          largura,
          altura,
          observacao,
          imagem
        )

        VALUES
        ($1,$2,$3,$4,$5,$6)

        RETURNING *
        `,

        [
          nome,
          linha,
          largura,
          altura,
          observacao,
          imagem
        ]

      );

    res.json(
      resultado.rows[0]
    );

  } catch (error) {

    console.log(error);

    res.status(500).json(error);

  }

});


// ======================================
// EXCLUIR
// ======================================

app.delete(
  "/api/tipologias/:id",
  async (req, res) => {

    try {

      await pool.query(

        `
        DELETE FROM tipologias
        WHERE id = $1
        `,

        [req.params.id]

      );

      res.json({
        ok: true
      });

    } catch (error) {

      console.log(error);

      res.status(500).json(error);

    }

  }
);


// ======================================
// EDITAR
// ======================================

app.put(
  "/api/tipologias/:id",
  async (req, res) => {

    try {

      const {

        nome,
        linha,
        largura,
        altura,
        observacao,
        imagem

      } = req.body;


      const resultado =
        await pool.query(

          `
          UPDATE tipologias

          SET

            nome = $1,
            linha = $2,
            largura = $3,
            altura = $4,
            observacao = $5,
            imagem = $6

          WHERE id = $7

          RETURNING *

          `,

          [

            nome,
            linha,
            largura,
            altura,
            observacao,
            imagem,

            req.params.id

          ]

        );

      res.json(
        resultado.rows[0]
      );

    } catch (error) {

      console.log(error);

      res.status(500).json(error);

    }

  }
);
app.listen(PORT, () => {

  console.log(
    `🚀 Backend rodando na porta ${PORT}`
  );

});