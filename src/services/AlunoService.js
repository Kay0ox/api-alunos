const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");
const EmailDuplicadoError = require("../errors/EmailDuplicadoError");

class AlunoService {

    async findMany(page, pageSize, orderBy, order) {

        const camposPermitidos = [
            "id",
            "nome",
            "email",
            "createdAt",
            "updatedAt"
        ];

        if (!camposPermitidos.includes(orderBy)) {
            orderBy = "id";
        }

        if (order !== "asc" && order !== "desc") {
            order = "asc";
        }

        const alunos = await prisma.aluno.findMany({
            skip: (page - 1) * pageSize,
            take: Number(pageSize),
            orderBy: {
                [orderBy]: order
            }
        });

        const total = await prisma.aluno.count();

        return {
            alunos,
            total
        };
    }


    async create(aluno) {

        const { nome, email } = aluno;

        if (!nome || !email) {
            throw new AlunoInvalidoError();
        }

        const novoAluno = await prisma.aluno.create({
            data: aluno
        });

        return novoAluno;
    }


    async findUnique(id) {

        const aluno = await prisma.aluno.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!aluno) {
            throw new AlunoNaoEncontradoError();
        }

        return aluno;
    }


    async update(id, dados) {

        const aluno = await prisma.aluno.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!aluno) {
            throw new AlunoNaoEncontradoError();
        }

        const { nome, email } = dados;

        if (!nome && !email) {
            // Reaproveitamos AlunoInvalidoError porque
            // continua sendo um erro de dados do aluno.
            throw new AlunoInvalidoError(
                "Informe nome e/ou email para atualizar"
            );
        }

        if (email) {

            const alunoComMesmoEmail = await prisma.aluno.findUnique({
                where: {
                    email: email
                }
            });

            if (
                alunoComMesmoEmail &&
                alunoComMesmoEmail.id !== Number(id)
            ) {
                throw new EmailDuplicadoError();
            }
        }

        const dadosAtualizacao = {};

        if (nome) {
            dadosAtualizacao.nome = nome;
        }

        if (email) {
            dadosAtualizacao.email = email;
        }

        const alunoAtualizado = await prisma.aluno.update({
            where: {
                id: Number(id)
            },
            data: dadosAtualizacao
        });

        return alunoAtualizado;
    }


    async delete(id) {

        const aluno = await prisma.aluno.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!aluno) {
            throw new AlunoNaoEncontradoError();
        }

        await prisma.aluno.delete({
            where: {
                id: Number(id)
            }
        });
    }

}

module.exports = new AlunoService();