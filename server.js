const express = require("express");

const cors = require("cors");

require("dotenv").config();

const { Pool } = require("pg");

const app = express();

app.use(cors());

app.use(express.json());

/* =========================
   POSTGRESQL ONLINE - NEON
========================= */

const pool = new Pool({

  connectionString:
    process.env.DATABASE_URL,

  ssl: {

    rejectUnauthorized: false,

  },

});

/* =========================
   TESTE BANCO
========================= */

pool.connect()

  .then(() => {

    console.log(
      "POSTGRES CONECTADO"
    );

  })

  .catch((err) => {

    console.log(
      "ERRO POSTGRES",
      err
    );

  });

/* =========================
   ROTA TESTE
========================= */

app.get("/", (req, res) => {

  res.send(
    "SERVIDOR INDUSTRIAL ONLINE"
  );

});

/* =========================
   CLIENTES
========================= */

app.get(
  "/clientes",
  async (req, res) => {

    try {

      const resultado =
        await pool.query(

          "SELECT * FROM clientes ORDER BY id DESC"

        );

      res.json(
        resultado.rows
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({

        erro:
          "Erro ao buscar clientes",

      });

    }

  }
);

app.post(
  "/clientes",
  async (req, res) => {

    try {

      const {
        nome,
        telefone,
        email,
        cidade
      } = req.body;

      const resultado =
        await pool.query(

          `
          INSERT INTO clientes
          (
            nome,
            telefone,
            email,
            cidade
          )

          VALUES
          ($1,$2,$3,$4)

          RETURNING *
          `,

          [
            nome,
            telefone,
            email,
            cidade
          ]

        );

      res.json(
        resultado.rows[0]
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({

        erro:
          "Erro ao salvar cliente",

      });

    }

  }
);

/* =========================
   PERFIS
========================= */

app.get(
  "/perfis",
  async (req, res) => {

    try {

      const resultado =
        await pool.query(

          "SELECT * FROM perfis ORDER BY id DESC"

        );

      res.json(
        resultado.rows
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({

        erro:
          "Erro ao buscar perfis",

      });

    }

  }
);

app.post(
  "/perfis",
  async (req, res) => {

    try {

      const {
        nome,
        linha,
        peso,
        valor_kg,
        cor
      } = req.body;

      const resultado =
        await pool.query(

          `
          INSERT INTO perfis
          (
            nome,
            linha,
            peso,
            valor_kg,
            cor
          )

          VALUES
          ($1,$2,$3,$4,$5)

          RETURNING *
          `,

          [
            nome,
            linha,
            peso,
            valor_kg,
            cor
          ]

        );

      res.json(
        resultado.rows[0]
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({

        erro:
          "Erro ao salvar perfil",

      });

    }

  }
);

/* =========================
   VIDROS
========================= */

app.get(
  "/vidros",
  async (req, res) => {

    try {

      const resultado =
        await pool.query(

          "SELECT * FROM vidros ORDER BY id DESC"

        );

      res.json(
        resultado.rows
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({

        erro:
          "Erro ao buscar vidros",

      });

    }

  }
);

app.post(
  "/vidros",
  async (req, res) => {

    try {

      const {
        nome,
        espessura,
        valor_m2,
        cor
      } = req.body;

      const resultado =
        await pool.query(

          `
          INSERT INTO vidros
          (
            nome,
            espessura,
            valor_m2,
            cor
          )

          VALUES
          ($1,$2,$3,$4)

          RETURNING *
          `,

          [
            nome,
            espessura,
            valor_m2,
            cor
          ]

        );

      res.json(
        resultado.rows[0]
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({

        erro:
          "Erro ao salvar vidro",

      });

    }

  }
);

/* =========================
   TIPOLOGIAS
========================= */

app.get(
  "/tipologias",
  async (req, res) => {

    try {

      const resultado =
        await pool.query(

          "SELECT * FROM tipologias ORDER BY id DESC"

        );

      res.json(
        resultado.rows
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({

        erro:
          "Erro ao buscar tipologias",

      });

    }

  }
);

app.post(
  "/tipologias",
  async (req, res) => {

    try {

      const {
        nome,
        linha,
        largura,
        altura,
        observacao
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
            observacao
          )

          VALUES
          ($1,$2,$3,$4,$5)

          RETURNING *
          `,

          [
            nome,
            linha,
            largura,
            altura,
            observacao
          ]

        );

      res.json(
        resultado.rows[0]
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({

        erro:
          "Erro ao salvar tipologia",

      });

    }

  }
);

/* =========================
   ORÇAMENTOS
========================= */

app.get(
  "/orcamentos",
  async (req, res) => {

    try {

      const resultado =
        await pool.query(

          "SELECT * FROM orcamentos ORDER BY id DESC"

        );

      res.json(
        resultado.rows
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({

        erro:
          "Erro ao buscar orçamentos",

      });

    }

  }
);

app.post(
  "/orcamentos",
  async (req, res) => {

    try {

      const {
        cliente,
        valor_total,
        descricao
      } = req.body;

      const resultado =
        await pool.query(

          `
          INSERT INTO orcamentos
          (
            cliente,
            valor_total,
            descricao
          )

          VALUES
          ($1,$2,$3)

          RETURNING *
          `,

          [
            cliente,
            valor_total,
            descricao
          ]

        );

      res.json(
        resultado.rows[0]
      );

    } catch (erro) {

      console.log(erro);

      res.status(500).json({

        erro:
          "Erro ao salvar orçamento",

      });

    }

  }
);

/* =========================
   SERVIDOR
========================= */
app.get("/perfis", async (req, res) => {

  try {

    const resultado = await pool.query(`
      SELECT * FROM perfis
      ORDER BY id DESC
    `);

    res.json(resultado.rows);

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro ao buscar perfis"
    });

  }

});

app.post("/perfis", async (req, res) => {

  try {

    const {
      nome,
      codigo,
      linha,
      cor,
      valor_barra,
      peso_kg
    } = req.body;

    const resultado = await pool.query(`
      INSERT INTO perfis
      (
        nome,
        codigo,
        linha,
        cor,
        valor_barra,
        peso_kg
      )

      VALUES ($1,$2,$3,$4,$5,$6)

      RETURNING *
    `, [
      nome,
      codigo,
      linha,
      cor,
      valor_barra,
      peso_kg
    ]);

    res.json(resultado.rows[0]);

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro ao salvar perfil"
    });

  }

});
app.get("/obras", async (req, res) => {
  try {

    const resultado = await pool.query(`
      SELECT * FROM obras
      ORDER BY id DESC
    `);

    res.json(resultado.rows);

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro ao buscar obras"
    });

  }
});

app.post("/obras", async (req, res) => {

  try {

    const {
      nome,
      cliente,
      endereco,
      cidade,
      status,
      observacao
    } = req.body;

    const resultado = await pool.query(`
      INSERT INTO obras (
        nome,
        cliente,
        endereco,
        cidade,
        status,
        observacao
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
    `,
    [
      nome,
      cliente,
      endereco,
      cidade,
      status,
      observacao
    ]);

    res.json(resultado.rows[0]);

  } catch (erro) {

    console.log(erro);

    res.status(500).json({
      erro: "Erro ao salvar obra"
    });

  }
});
app.listen(PORT, () => {

  console.log("Servidor rodando");

});
app.listen(
  3001,
  "0.0.0.0",
  () => {

    console.log(
      "SERVIDOR INDUSTRIAL RODANDO NA PORTA 3001"
    );

  }
);