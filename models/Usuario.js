// Importa o módulo de configuração do banco de dados
const db = require("./db");

// Define o modelo "usuario" no Sequelize
// Este modelo representa uma tabela no banco de dados
// Cada propriedade do objeto define uma coluna na tabela
const Usuario = db.sequelize.define("usuario", {
	id: {
		type: db.Sequelize.INTEGER, // Tipo da coluna "id" é um inteiro
		autoIncrement: true, // A coluna "id" é auto-incrementável
		allowNull: false, // Não permite null na coluna "id"
		primaryKey: true, // Define como chave primária
	},
	nome: {
		type: db.Sequelize.STRING, // Tipo da coluna "nome" é string
		allowNull: false, // Não permite null na coluna "nome"
	},
	email: {
		type: db.Sequelize.STRING, // Tipo da coluna "email" é string
		allowNull: false, // Não permite null na coluna "email"
	},
});

// Sincroniza o modelo "Usuario" com o banco de dados, criando ou alterando a tabela como necessário
Usuario.sync();

// Exporta o modelo "Usuario" para ser usado em outros arquivos
module.exports = Usuario;
