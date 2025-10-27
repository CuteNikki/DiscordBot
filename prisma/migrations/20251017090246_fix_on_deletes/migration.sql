-- DropForeignKey
ALTER TABLE "public"."Infraction" DROP CONSTRAINT "Infraction_guildId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MessageBuilder" DROP CONSTRAINT "MessageBuilder_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoleMenu" DROP CONSTRAINT "RoleMenu_guildId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RoleMenuRole" DROP CONSTRAINT "RoleMenuRole_roleMenuId_fkey";

-- AddForeignKey
ALTER TABLE "RoleMenu" ADD CONSTRAINT "RoleMenu_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleMenuRole" ADD CONSTRAINT "RoleMenuRole_roleMenuId_fkey" FOREIGN KEY ("roleMenuId") REFERENCES "RoleMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageBuilder" ADD CONSTRAINT "MessageBuilder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE CASCADE ON UPDATE CASCADE;
