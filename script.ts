import { PrismaClient } from '@prisma/client';
import { enhance, withPolicy } from '@zenstackhq/runtime';
import { inspect } from 'util';

const prisma = new PrismaClient();

// A `main` function so that we can use async/await
async function main() {
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
        data: { name: 'User1', email: 'user1@abc.com' },
    });

    const anonymousDb = enhance(prisma);
    console.log(
        'Read with anonymous:',
        inspect(await anonymousDb.user.findUnique({ where: { id: user.id } }))
    );

    const userDb = enhance(prisma, { user: { id: user.id } });
    console.log(
        'Read with user:',
        inspect(await userDb.user.findUnique({ where: { id: user.id } }))
    );

    const policyDb = withPolicy(prisma, { user: { id: user.id } });
    console.log(
        'Read with policy only:',
        inspect(await policyDb.user.findUnique({ where: { id: user.id } }))
    );
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
