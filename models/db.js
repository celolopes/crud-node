// Se o sequelize for um módulo do Node.js que fornece uma forma abstrata de interagir com bancos de dados SQL,
// o código a seguir importa o módulo 'sequelize'.

// npm install sequelize
// npm install mysql2
const Sequelize = require("sequelize");

// Cria uma instância de conexão com o banco de dados chamado 'node_exemplo' usando o sequelize.
// O usuário é 'root' e a senha está vazia.
// A configuração do host define o endereço localhost (127.0.0.1)
// O 'dialect' é o tipo de banco de dados (neste caso, mysql).
// Além disso, verifica as configurações de codificação para ser 'utf8' e o esquema de collation para 'utf8_general_ci',
// garante que os timestamps são usados e desativa os logs de sequelize.
const sequelize = new Sequelize("node_exemplo", "root", "", {
	host: "127.0.0.1",
	dialect: "mysql",
	define: {
		charset: "utf8",
		collate: "utf8_general_ci",
		timestamps: true,
	},
	logging: false,
});

/* Esse pedaço de código testa a conexão com o banco de dados.
Se a conexão for bem sucedida, então ele logará 'Conectado ao banco com sucesso!',
se não, ele logará a mensagem de erro.
Este bloco de código foi comentado porque pode não ser útil em um ambiente de produção real.

sequelize.authenticate().then(function(){
    console.log('Conectado no banco com sucesso!');
}).catch(function(err){
    console.log('Falha ao se conectar: '+err);
})
*/

// Finalmente, o módulo exports o 'Sequelize' e a instância 'sequelize'.
// Isso permite que outros módulos possam reutilizá-los sem ter que criar uma nova instância de conexão.
module.exports = { Sequelize, sequelize };
