# crud-node
# Aplicação Express.js de Gerenciamento de Usuários

Esta é uma aplicação de servidor web baseada em Express.js que fornece funcionalidades de gerenciamento de usuários. Ela é capaz de listar usuários, criar novos usuários, editar e deletar usuários existentes.

## Requisitos

* Node.js
* npm
* Express.js
* Sequelize (ORM para interação com o banco de dados)
* Express-handlebars (motor de templates)
* Express-session (para gerenciamento de sessões)
* Body-parser (para análise do corpo das requisições HTTP)
* Bootstrap (para estilização)

## Configuração e Uso

1. Clone este repositório.
2. Navegue até a pasta do repositório e instale as dependências usando o comando `npm install`.
3. Inicie a aplicação com o comando `node index.js`.

A aplicação será iniciada e estará escutando na porta definida pela variável de ambiente `PORT` ou, se essa não estiver definida, na porta 3000.

As rotas disponíveis são:

* GET `/`: Página principal. Esta página exibe um formulário de criação de usuários.
* GET `/users`: Listagem de usuários. Esta página exibe todos os usuários registrados no sistema.
* POST `/cad`: Rota de cadastro de novos usuários. Esta rota recebe os dados de um novo usuário e cria esse usuário no banco de dados.
* POST `/del`: Rota para deletar um usuário. Esta rota recebe o ID de um usuário e remove esse usuário do banco de dados.
* POST `/editar`: Rota para editar um usuário. Esta rota recebe o ID de um usuário e exibe uma página com um formulário de edição de usuários.
* POST `/update`: Rota para atualizar os dados de um usuário. Esta rota recebe os novos dados de um usuário e atualiza esses dados no banco de dados.

## Observações

Esta aplicação pressupõe a existência de um modelo de banco de dados 'Usuario'. Para utilizar esta aplicação, será necessário criar este modelo e configurar o Sequelize para utilizar o banco de dados desejado.

Todas as requisições POST devem ser enviadas com um corpo no formato `application/x-www-form-urlencoded`. As chaves esperadas no corpo da requisição estão detalhadas em cada rota.

Este código é apenas para fins demonstrativos e pode requerer modificações para ser usado em um ambiente de produção.
