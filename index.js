// Carregar os módulos necessários
const express = require("express"); // Framework web
const fs = require("fs"); // File system for bootstrap.min.css file check
const app = express();
const hbs = require("express-handlebars"); // Templates engine
const hostname = "10.10.8.142"; // Hostname do servidor
const bodyParser = require("body-parser"); // Middleware para parse do corpo da requisição
const session = require("express-session"); // Módulo para gerenciamento de sessões
const PORT = process.env.PORT || 3000; // Porta onde o servidor vai rodar

// Verify that bootstrap.min.css file exists in the public/css directory
fs.access("./public/css/bootstrap.min.css", fs.constants.F_OK, (err) => {
	console.log(`${err ? "File does not exist" : "File exists"}`);
});
/**
 * Configuração do Handlebars.
 */

// Define o motor de template para utilizar o 'Handlebars' (hbs).
app.engine(
	"hbs", // A extensão do arquivo a ser utilizada para os templates.
	hbs.engine({
		extname: "hbs", // Define a extensão padrão para os arquivos de template.
		defaultLayout: "main", // Define o layout padrão para todas as views (a menos que seja especificado de outra forma).
	}),
);

// Registra o 'Handlebars' como view engine.
// O Motor de View é responsável por renderizar a resposta final que é enviada ao cliente.
app.set("view engine", "hbs");

app.use(express.static("public")); // Public é a pasta de arquivos estáticos
app.use(bodyParser.urlencoded({ extended: false }));
//Importar Model Usuário
const Usuario = require("./models/Usuario");
const { table } = require("console");

//Configuração das Sessions
app.use(
	session({
		secret: "CriarUmaChaveQualquer1234",
		resave: false,
		saveUninitialized: true,
	}),
);

// Get na página princial do controller com tratamentos de Sessions
app.get("/", (req, res) => {
	if (req.session.errors) {
		var arrayErrors = req.session.errors;
		req.session.errors = "";
		return res.render("index", { NavActiveCad: true, error: arrayErrors });
	}

	if (req.session.success) {
		req.session.success = false;
		return res.render("index", { NavActiveCad: true, MsgSuccess: true });
	}
	res.render("index", { NavActiveCad: true });
});

// Get da Listagem de Usuários verificando se existem dados na tabela para listar na página Users
app.get("/users", (req, res) => {
	Usuario.findAll()
		.then(function (valores) {
			//console.log(valores.map(valores => valores.toJSON()));
			if (valores.length > 0) {
				return res.render("users", { NavActiveUsers: true, table: true, usuarios: valores.map((valores) => valores.toJSON()) });
			} else {
				res.render("users", { NavActiveUsers: true, table: false });
			}
		})
		.catch(function (err) {
			console.log(`Houve um problema: ${err}`);
		});
	//res.render("users", { NavActiveUsers: true });
});

app.post("/editar", (req, res) => {
	// Rota da página de edição
	var id = req.body.id;
	Usuario.findByPk(id)
		.then((dados) => {
			return res.render("editar", { error: false, id: dados.id, nome: dados.nome, email: dados.email });
		})
		.catch((err) => {
			console.log(err);
			return res.render("editar", { error: true, problema: "Não foi possível editar esse registro" });
		});
	//res.render("editar");
});

app.post("/del", (req, res) => {
	Usuario.destroy({
		where: {
			id: req.body.id,
		},
	})
		.then((retorno) => {
			return res.redirect("/users");
		})
		.catch((err) => {
			console.log(`Ops, houve um erro: ${err}`);
		});
});

app.post("/cad", (req, res) => {
	// Rota de cadastro
	// Extração dos valores vindos do formulário
	var nome = req.body.nome;
	var email = req.body.email;
	// Inicialização do array de erros
	const erros = [];
	// Limpeza dos espaços em branco antes e depois dos valores
	nome = nome.trim();
	email = email.trim();
	// Limpeza do nome de caracteres especiais (apenas letras são permitidas)
	nome = nome.replace(/[^A-zÀ-ú\s]/gi, "");
	// Verificação da validade de cada campo
	if (nome == "" || typeof nome == undefined || nome == null) {
		erros.push({ mensagem: "Campo nome não pode ser vazio!" });
	}
	// Apenas letras são permitidas no nome
	if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ'\s]+$/.test(nome)) {
		erros.push({ mensagem: "Nome inválido!" });
	}
	if (email == "" || typeof email == undefined || email == null) {
		erros.push({ mensagem: "Campo email não pode ser vazio!" });
	}
	// Verificação da validação do email
	if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
		erros.push({ mensagem: "Campo email inválido!" });
	}
	// Se não existem erros, salva os dados no banco de dados
	Usuario.findOne({ where: { email: email.toLowerCase() } })
		.then((usuarioExistente) => {
			if (usuarioExistente) {
				erros.push({ mensagem: "E-mail já está em uso!" });
				req.session.errors = erros;
				req.session.success = false;
				return res.redirect("/");
			} else {
				// Se o usuário não existe, tenta criar um novo
				Usuario.create({
					nome: nome,
					email: email.toLowerCase(),
				})
					.then((usuario) => {
						console.log(`${usuario.toJSON()} Cadastrado com sucesso`);
						req.session.success = true;
						return res.redirect("/");
					})
					.catch((erro) => {
						console.log(`Ops, houve um erro: ${erro}`);
						erros.push({ mensagem: "Erro ao cadastrar usuário" });
						req.session.errors = erros;
						req.session.success = false;
						return res.redirect("/");
					});
			}
		})
		.catch((erro) => {
			console.log(`Ops, houve um erro: ${erro}`);
			erros.push({ mensagem: "Erro ao verificar o usuário" });
			req.session.errors = erros;
			req.session.success = false;
			return res.redirect("/");
		});
	// Se existem erros, volta para a página principal com erros
	if (erros.length > 0) {
		console.log(erros);
		req.session.errors = erros;
		req.session.success = false;
		return res.redirect("/");
	}
});

app.post("/update", (req, res) => {
	//Rota de Edição de Registro
	//Validação
	var nome = req.body.nome;
	var email = req.body.email;
	// Inicialização do array de erros
	const erros = [];
	// Limpeza dos espaços em branco antes e depois dos valores
	email = email.trim();
	// Limpeza do nome de caracteres especiais (apenas letras são permitidas)
	nome = nome.replace(/[^A-zÀ-ú\s]/gi, "");
	nome = nome.trim();
	// Verificação da validade de cada campo
	if (nome == "" || typeof nome == undefined || nome == null) {
		erros.push({ mensagem: "Campo nome não pode ser vazio!" });
	}
	// Apenas letras são permitidas no nome
	if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ'\s]+$/.test(nome)) {
		erros.push({ mensagem: "Nome inválido!" });
	}
	if (email == "" || typeof email == undefined || email == null) {
		erros.push({ mensagem: "Campo email não pode ser vazio!" });
	}
	// Verificação da validação do email
	if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
		erros.push({ mensagem: "Campo email inválido!" });
	}
	// Se existem erros, volta para a página principal com erros
	if (erros.length > 0) {
		console.log(erros);
		return res.status(400).send({ status: 400, erro: erros });
	}
	//Fim de Validação
	//Atualizar no Banco
	var id = req.body.id;
	Usuario.update(
		{
			nome: nome,
			email: email.toLowerCase(),
		},
		{
			where: {
				id: id,
			},
		},
	)
		.then((resultado) => {
			console.log(resultado);
			return res.redirect("/users");
		})
		.catch((err) => {
			console.log(`Ops, houve algum erro: ${err}`);
			return res.status(400).send({ status: 400, erro: "Email já cadastrado" });
		});
});

// Iniciar o servidor
app.listen(PORT, () => {
	console.log("Servidor rodando em http://127.0.0.1:"+PORT);
});
