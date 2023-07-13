// Carrega o módulo Express, um framework para aplicações web.
const express = require("express");

// Carrega o módulo do sistema de arquivos (fs), usado para manipular arquivos.
const fs = require("fs");

// Cria uma instância do Express.
const app = express();

// Carrega o módulo express-handlebars, que permite o uso do Handlebars como mecanismo de template.
const hbs = require("express-handlebars");

// Define o hostname para o servidor.
const hostname = "10.10.8.142";

// Carrega o módulo body-parser, um middleware para analisar o corpo das requisições.
const bodyParser = require("body-parser");

// Carrega o módulo express-session, que permite gerenciar sessões de usuário.
const session = require("express-session");

// Define a porta onde o servidor irá rodar. Se a variável de ambiente PORT estiver definida, usa ela. Caso contrário, usa 3000.
const PORT = process.env.PORT || 3000;

// Verifica se o arquivo bootstrap.min.css existe no diretório public/css.
fs.access("./public/css/bootstrap.min.css", fs.constants.F_OK, (err) => {
	console.log(`${err ? "Arquivo não existe" : "Arquivo existe"}`);
});

// Define o mecanismo de template para usar o 'Handlebars' (hbs).
app.engine(
	"hbs",
	hbs.engine({
		extname: "hbs", // Define a extensão padrão para os arquivos de template.
		defaultLayout: "main", // Define o layout padrão para todas as views (a menos que seja especificado de outra forma).
	}),
);

// Registra o 'Handlebars' como view engine.
app.set("view engine", "hbs");

// Define o diretório 'public' como local de arquivos estáticos.
app.use(express.static("public"));

// Configura o bodyParser para analisar requisições com corpo no formato urlencoded.
app.use(bodyParser.urlencoded({ extended: false }));

// Importa o modelo de Usuário.
const Usuario = require("./models/Usuario");

// Configuração das Sessions.
app.use(
	session({
		secret: "CriarUmaChaveQualquer1234",
		resave: false,
		saveUninitialized: true,
	}),
);

// Define o roteamento GET para a raiz do site ("/").
app.get("/", (req, res) => {
	// Se houverem erros na sessão, renderiza a página inicial com os erros.
	// Após a renderização, limpa os erros da sessão.
	if (req.session.errors) {
		var arrayErrors = req.session.errors;
		req.session.errors = "";
		return res.render("index", { NavActiveCad: true, error: arrayErrors });
	}
	// Se houve sucesso na sessão, renderiza a página inicial com uma mensagem de sucesso.
	// Após a renderização, limpa o indicador de sucesso da sessão.
	if (req.session.success) {
		req.session.success = false;
		return res.render("index", { NavActiveCad: true, MsgSuccess: true });
	}
	// Se não houve nem erro nem sucesso, renderiza a página inicial normalmente.
	res.render("index", { NavActiveCad: true });
});

// Define o roteamento GET para a página de listagem de usuários ("/users").
app.get("/users", (req, res) => {
	// Busca todos os usuários.
	Usuario.findAll()
		.then(function (valores) {
			// Se houverem usuários, renderiza a página de listagem com a tabela de usuários.
			if (valores.length > 0) {
				return res.render("users", { NavActiveUsers: true, table: true, usuarios: valores.map((valores) => valores.toJSON()) });
			} else {
				// Se não houverem usuários, renderiza a página de listagem sem a tabela.
				res.render("users", { NavActiveUsers: true, table: false });
			}
		})
		.catch(function (err) {
			// Em caso de erro na busca de usuários, loga o erro.
			console.log(`Houve um problema: ${err}`);
		});
});

// Define o roteamento POST para a edição de usuários ("/editar").
app.post("/editar", (req, res) => {
	var id = req.body.id;
	// Busca o usuário pelo ID.
	Usuario.findByPk(id)
		.then((dados) => {
			// Se o usuário foi encontrado, renderiza a página de edição com os dados do usuário.
			return res.render("editar", { error: false, id: dados.id, nome: dados.nome, email: dados.email });
		})
		.catch((err) => {
			// Se houve um erro na busca, renderiza a página de edição com uma mensagem de erro.
			console.log(err);
			return res.render("editar", { error: true, problema: "Não foi possível editar esse registro" });
		});
});

// Define o roteamento POST para a exclusão de usuários ("/del").
app.post("/del", (req, res) => {
	// Deleta o usuário pelo ID.
	Usuario.destroy({
		where: {
			id: req.body.id,
		},
	})
		.then((retorno) => {
			// Se o usuário foi excluído com sucesso, redireciona para a página de listagem de usuários.
			return res.redirect("/users");
		})
		.catch((err) => {
			// Se houve um erro na exclusão, loga o erro.
			console.log(`Ops, houve um erro: ${err}`);
		});
});

// Define o roteamento POST para o cadastro de usuários ("/cad").
app.post("/cad", (req, res) => {
	var nome = req.body.nome;
	var email = req.body.email;
	const erros = [];
	nome = nome.trim();
	email = email.trim();
	nome = nome.replace(/[^A-zÀ-ú\s]/gi, "");
	// Se nome ou email estiverem vazios, ou se nome contiver caracteres especiais, ou se email não for válido,
	// adiciona o erro correspondente ao array de erros.
	if (nome == "" || typeof nome == undefined || nome == null) {
		erros.push({ mensagem: "Campo nome não pode ser vazio!" });
	}
	if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ'\s]+$/.test(nome)) {
		erros.push({ mensagem: "Nome inválido!" });
	}
	if (email == "" || typeof email == undefined || email == null) {
		erros.push({ mensagem: "Campo email não pode ser vazio!" });
	}
	if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
		erros.push({ mensagem: "Email inválido!" });
	}

	// Se houverem erros, armazena-os na sessão e redireciona para a página inicial.
	if (erros.length > 0) {
		req.session.errors = erros;
		return res.redirect("/");
	}

	// Se não houverem erros, cria um novo usuário.
	Usuario.create({
		nome: nome,
		email: email,
	})
		.then(() => {
			// Se o usuário foi criado com sucesso, armazena a mensagem de sucesso na sessão e redireciona para a página inicial.
			req.session.success = true;
			return res.redirect("/");
		})
		.catch((err) => {
			// Se houve um erro na criação do usuário, loga o erro.
			console.log(`Houve um erro: ${err}`);
		});
});

// Faz com que o servidor comece a escutar as requisições na porta definida anteriormente.
app.listen(PORT, hostname, () => {
	console.log(`Servidor rodando em http://${hostname}:${PORT}`);
});
