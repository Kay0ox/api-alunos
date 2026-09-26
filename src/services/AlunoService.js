const { skip, dmmfToRuntimeDataModel } = require("@prisma/client/runtime/client");
const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");

class AlunoService{

    async findMany(page, pageSize, orderBy, order)
    {
        const camposPermitidos =[
            "id",
            "nome",
            "email",
            "createdAt",
            "updateAt"
        ];

        if(!camposPermitidos.includes(orderBy)){
            orderBy - "id";
        }
        if(order !== "asc" && order !== "desc"){
            order = "asc";
        }

        const alunos = await prisma.aluno.findMany({
            skip: (page-1)*pageSize,
            take: Number(pageSize),
            orderBy: {
                [orderBy]: order
            }
        });

        const total = await prisma.aluno.count();

        return{
            alunos,
            total
        };
        
    }

    async create(aluno){
        const {nome, email} = aluno;
        if(!nome || !email){
            throw new AlunoInvalidoError();
        }

        const novoAluno = await prisma.aluno.create({data: aluno});

        return novoAluno;
    }
}

module.exports = new AlunoService();