-- CreateEnum
CREATE TYPE "InfractionType" AS ENUM ('Ban', 'Tempban', 'Unban', 'Kick', 'Timeout', 'Warn');

-- CreateEnum
CREATE TYPE "RoleMenuMode" AS ENUM ('SingleSelect', 'MultiSelect');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Guild" (
    "guildId" TEXT NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Blacklist" (
    "userId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "RoleMenu" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "description" TEXT,
    "requiredRoles" TEXT[],
    "excludedRoles" TEXT[],
    "mode" "RoleMenuMode" NOT NULL DEFAULT 'MultiSelect',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleMenuRole" (
    "id" TEXT NOT NULL,
    "roleMenuId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,

    CONSTRAINT "RoleMenuRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageBuilder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT,
    "content" TEXT,
    "embed" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageBuilder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Infraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT false,
    "type" "InfractionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Infraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_guildId_key" ON "Guild"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Blacklist_userId_key" ON "Blacklist"("userId");

-- CreateIndex
CREATE INDEX "blacklist_moderator" ON "Blacklist"("moderatorId");

-- CreateIndex
CREATE INDEX "rolemenu_guild" ON "RoleMenu"("guildId");

-- CreateIndex
CREATE INDEX "rolemenu_channel" ON "RoleMenu"("channelId");

-- CreateIndex
CREATE INDEX "rolemenu_message" ON "RoleMenu"("messageId");

-- CreateIndex
CREATE INDEX "rolemenu_guild_message" ON "RoleMenu"("guildId", "messageId");

-- CreateIndex
CREATE INDEX "rolemenurole_rolemenu" ON "RoleMenuRole"("roleMenuId");

-- CreateIndex
CREATE INDEX "rolemenurole_role" ON "RoleMenuRole"("roleId");

-- CreateIndex
CREATE INDEX "rolemenurole_emoji" ON "RoleMenuRole"("emoji");

-- CreateIndex
CREATE INDEX "messagebuilder_user" ON "MessageBuilder"("userId");

-- CreateIndex
CREATE INDEX "messagebuilder_guild" ON "MessageBuilder"("guildId");

-- CreateIndex
CREATE INDEX "messagebuilder_channel" ON "MessageBuilder"("channelId");

-- CreateIndex
CREATE INDEX "messagebuilder_message" ON "MessageBuilder"("messageId");

-- CreateIndex
CREATE INDEX "infraction_user" ON "Infraction"("userId");

-- CreateIndex
CREATE INDEX "infraction_guild" ON "Infraction"("guildId");

-- CreateIndex
CREATE INDEX "infraction_user_guild" ON "Infraction"("userId", "guildId");

-- CreateIndex
CREATE INDEX "infraction_moderator_guild" ON "Infraction"("moderatorId", "guildId");

-- CreateIndex
CREATE INDEX "infraction_type" ON "Infraction"("type");

-- AddForeignKey
ALTER TABLE "Blacklist" ADD CONSTRAINT "Blacklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleMenu" ADD CONSTRAINT "RoleMenu_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleMenuRole" ADD CONSTRAINT "RoleMenuRole_roleMenuId_fkey" FOREIGN KEY ("roleMenuId") REFERENCES "RoleMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageBuilder" ADD CONSTRAINT "MessageBuilder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infraction" ADD CONSTRAINT "Infraction_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;
