require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

/* =====================================================
   PASTA UPLOADS
===================================================== */

const pastaUploads = path.join(__dirname, "uploads");

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads);
}

app.use("/uploads", express.static(pastaUploads));

/* =====================================================
   MULTER
===================================================== */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaUploads);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  },
});

const upload = multer({
  storage,
});

/* =====================================================
   BANCO TEMPORÁRIO
===================================================== */

let perfis = [];
let acessorios = [];
let vidros = [];
let tipologias = [];
let fachadas = [];

/* =====================================================
   PERFIS
===================================================== */

app.get("/perfis", (req, res) => {
  res.json(perfis);
});

app.post(
  "/perfis",
  upload.single("imagem"),
  (req, res) => {
    const novo = {
      id: Date.now(),

      codigo: req.body.codigo,
      descricao: req.body.descricao,
      valor: req.body.valor,
      peso: req.body.peso,

      imagem: req.file
        ? `/uploads/${req.file.filename}`
        : "",
    };

    perfis.push(novo);

    res.json(novo);
  }
);

app.delete("/perfis/limpar", (req, res) => {
  perfis = [];

  res.json({
    sucesso: true,
    mensagem: "Perfis apagados",
  });
});

/* =====================================================
   ACESSÓRIOS
===================================================== */

app.get("/acessorios", (req, res) => {
  res.json(acessorios);
});

app.post(
  "/acessorios",
  upload.single("imagem"),
  (req, res) => {
    const novo = {
      id: Date.now(),

      codigo: req.body.codigo,
      descricao: req.body.descricao,
      valor: req.body.valor,

      imagem: req.file
        ? `/uploads/${req.file.filename}`
        : "",
    };

    acessorios.push(novo);

    res.json(novo);
  }
);

app.delete("/acessorios/limpar", (req, res) => {
  acessorios = [];

  res.json({
    sucesso: true,
    mensagem: "Acessórios apagados",
  });
});

/* =====================================================
   VIDROS
===================================================== */

app.get("/vidros", (req, res) => {
  res.json(vidros);
});

app.post(
  "/vidros",
  upload.single("imagem"),
  (req, res) => {
    const novo = {
      id: Date.now(),

      codigo: req.body.codigo,
      descricao: req.body.descricao,
      valor: req.body.valor,
      espessura: req.body.espessura,

      imagem: req.file
        ? `/uploads/${req.file.filename}`
        : "",
    };

    vidros.push(novo);

    res.json(novo);
  }
);

app.delete("/vidros/limpar", (req, res) => {
  vidros = [];

  res.json({
    sucesso: true,
    mensagem: "Vidros apagados",
  });
});

/* =====================================================
   TIPOLOGIAS
===================================================== */

app.get("/tipologias", (req, res) => {
  res.json(tipologias);
});

app.post(
  "/tipologias",
  upload.single("imagem"),
  (req, res) => {
    const nova = {
      id: Date.now(),

      nome: req.body.nome,
      linha: req.body.linha,
      largura: req.body.largura,
      altura: req.body.altura,
      observacao: req.body.observacao,

      imagem: req.file
        ? `/uploads/${req.file.filename}`
        : "",
    };

    tipologias.push(nova);

    res.json(nova);
  }
);

app.delete("/tipologias/limpar", (req, res) => {
  tipologias = [];

  res.json({
    sucesso: true,
    mensagem: "Tipologias apagadas",
  });
});

/* =====================================================
   FACHADAS
===================================================== */

app.get("/fachadas", (req, res) => {
  res.json(fachadas);
});

app.post("/fachadas", (req, res) => {
  const fachada = {
    id: Date.now(),
    ...req.body,
  };

  fachadas.push(fachada);

  res.json(fachada);
});

app.delete("/fachadas/limpar", (req, res) => {
  fachadas = [];

  res.json({
    sucesso: true,
    mensagem: "Fachadas apagadas",
  });
});

/* =====================================================
   ROTA TESTE
===================================================== */

app.get("/", (req, res) => {
  res.send("Servidor ERP Esquadrias ONLINE");
});

/* =====================================================
   PORTA
===================================================== */

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `🚀 Servidor rodando na porta ${PORT}`
  );
});