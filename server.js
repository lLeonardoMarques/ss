const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

if (!MONGO_URI) {
  console.error('ERRO: MONGO_URI nao definida no .env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas! (banco: agend)'))
  .catch((err) => console.error('Falha ao conectar:', err.message));

const AgendamentoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    telefone: { type: String, required: true, trim: true },
    procedimento: { type: String, required: true, trim: true },
    procedimentoPreco: { type: String },
    data: { type: String, required: true },
    horario: { type: String, required: true },
    observacoes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['confirmado', 'pendente', 'cancelado'],
      default: 'confirmado',
    },
  },
  { timestamps: true }
);

const Agendamento = mongoose.model('Agendamento', AgendamentoSchema);

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Servidor de Agendamentos rodando!',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/agendamentos', async (req, res) => {
  try {
    const {
      nome,
      telefone,
      procedimento,
      procedimentoPreco,
      data,
      horario,
      observacoes,
    } = req.body;

    if (!nome || !telefone || !procedimento) {
      return res.status(400).json({
        success: false,
        error: 'Nome, Telefone e Procedimento sao obrigatorios.',
      });
    }

    const novo = new Agendamento({
      nome,
      telefone,
      procedimento,
      procedimentoPreco,
      data,
      horario,
      observacoes,
    });

    const salvo = await novo.save();
    console.log(`Novo agendamento: ${nome} (${telefone}) - ${procedimento}`);

    return res.status(201).json({
      success: true,
      message: 'Agendamento salvo com sucesso!',
      data: salvo,
    });
  } catch (error) {
    console.error('Erro ao salvar agendamento:', error);
    return res.status(500).json({ success: false, error: 'Erro interno.' });
  }
});

app.get('/api/agendamentos', async (req, res) => {
  try {
    const agendamentos = await Agendamento.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: agendamentos.length,
      data: agendamentos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar agendamentos.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`POST http://localhost:${PORT}/api/agendamentos`);
  console.log(`GET  http://localhost:${PORT}/api/agendamentos`);
});