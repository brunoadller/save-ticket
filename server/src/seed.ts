import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

async function main() {
  const name = process.env.SEED_ADMIN_NAME || "Administrador";
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "mude-esta-senha";

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    console.log(`Usuário admin "${email}" já existe. Nada a fazer.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: { name, email, passwordHash, role: "ADMIN" },
  });

  console.log(`Usuário administrador criado: ${admin.email}`);
  console.log(`Use este e-mail e a senha definida em SEED_ADMIN_PASSWORD para o primeiro login.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
