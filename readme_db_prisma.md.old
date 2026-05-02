# HOW TO CHANGE DB, and update schema

1. Prepare Schema.prisma file under prisma folder
2. Setup generator client , datasource db section
3. Run npx prisma db pull --schema .\prisma\schema.prisma.mysql ( <- need to change schema.prisma file )
   This would retrieve DB Schema file from specified DB connection information in schema.prisma file, and reflect every table information in the same file

4. npx prisma generate --schema .\prisma\schema.prisma.mysql
   This would read prisma schema file and generate under node_modules/@prisma/client
   --schema to be specified

# After Setup, what to do to change DB? ( Like integration test etc)

1. Change env file through dotenv-cli
2. Update client module through npx prisma generate command
3. Initialize DB status if you launch Docker DB,etc ->How?
   => DML setup, initial record setup, etc

# notes for SIT

prisma generate --schema .\prisma\schema.prisma.postgre
--inject docker run + initialization
dotenv -e .env.sit -- -- jest --config=./jest.sit.config.js
docker-compose -f .\test-docker\docker-compose.yml up -d
