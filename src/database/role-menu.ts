import { prisma } from 'database/index';
import type { RoleMenuMode } from 'generated/client';

/**
 * Get all RoleMenus for a guild
 * @param guildId the id of the guild
 * @returns array of RoleMenus
 */
export const getRoleMenus = (guildId: string) =>
  prisma.roleMenu.findMany({
    where: { guildId },
    include: { roles: true },
  });

export const getRoleMenuCount = (guildId: string) =>
  prisma.roleMenu.count({
    where: { guildId },
  });

/**
 * Get a RoleMenu by its id
 * @param roleMenuId the id of the RoleMenu
 * @returns the RoleMenu with associated RoleMenuRole entries
 */
export const getRoleMenuById = (roleMenuId: string) =>
  prisma.roleMenu.findUnique({
    where: { id: roleMenuId },
    include: { roles: true },
  });

/**
 * Get a RoleMenu by guildId and messageId
 * @param guildId the id of the guild
 * @param messageId the id of the message
 * @returns the RoleMenu with associated RoleMenuRole entries
 */
export const getRoleMenuByMessageId = (guildId: string, messageId: string) =>
  prisma.roleMenu.findFirst({
    where: { guildId, messageId },
    include: { roles: true },
  });

/**
 * Create a new RoleMenu with associated RoleMenuRole entries
 * @param guildId the id of the guild
 * @param channelId the id of the channel
 * @param messageId the id of the message
 * @param mode the mode of the RoleMenu (SINGLE or MULTIPLE)
 * @param roles array of roles with roleId and emoji to associate with the RoleMenu
 * @param requiredRoles array of roleIds required to select from this RoleMenu
 * @param excludedRoles array of roleIds that exclude selection from this RoleMenu
 * @param description optional description of the RoleMenu
 * @returns the created RoleMenu
 */
export const createRoleMenu = (
  guildId: string,
  channelId: string,
  messageId: string,
  mode: RoleMenuMode,
  roles: { roleId: string; emoji: string }[] = [],
  requiredRoles: string[] = [],
  excludedRoles: string[] = [],
  description?: string,
) =>
  prisma.roleMenu.create({
    data: {
      guildId,
      channelId,
      messageId,
      description,
      mode,
      requiredRoles,
      excludedRoles,
      roles: {
        create: roles,
      },
    },
    include: { roles: true },
  });

/**
 * Delete a RoleMenu and its associated RoleMenuRole entries
 * @param id the id of the RoleMenu to delete
 * @returns the deleted RoleMenu entry
 */
export const deleteRoleMenu = (id: string) =>
  prisma.roleMenu.delete({
    where: { id },
  });

/**
 * Update the messageId of a RoleMenu
 * @param id the id of the RoleMenu
 * @param messageId the new messageId to set
 * @returns the updated RoleMenu entry
 */
export const updateRoleMenuMessageId = (id: string, messageId: string) =>
  prisma.roleMenu.update({
    where: { id },
    data: { messageId },
  });

/**
 * Add a role to a RoleMenu
 * @param roleMenuId the id of the RoleMenu
 * @param roleId the id of the role to add
 * @param emoji the emoji associated with the role
 * @returns the created RoleMenuRole entry
 */
export const addRoleMenuRole = (roleMenuId: string, roleId: string, emoji: string) =>
  prisma.roleMenuRole.create({
    data: { roleMenuId, roleId, emoji },
  });

/**
 * Remove a role from a RoleMenu
 * @param roleMenuId the id of the RoleMenu
 * @param roleId the id of the role to remove
 * @returns the deleted RoleMenuRole entry
 */
export const removeRoleMenuRole = (roleMenuId: string, roleId: string) =>
  prisma.roleMenuRole.deleteMany({
    where: { roleMenuId, roleId },
  });

/**
 * Update the emoji of a RoleMenuRole entry
 * @param id the id of the RoleMenuRole entry
 * @param emoji the new emoji to set
 * @returns the updated RoleMenuRole entry
 */
export const updateRoleMenuRoleEmoji = (id: string, emoji: string) =>
  prisma.roleMenuRole.update({
    where: { id },
    data: { emoji },
  });

/**
 * Update the roleId of a RoleMenuRole entry
 * @param id the id of the RoleMenuRole entry
 * @param roleId the new roleId to set
 * @returns the updated RoleMenuRole entry
 */
export const updateRoleMenuRoleRoleId = (id: string, roleId: string) =>
  prisma.roleMenuRole.update({
    where: { id },
    data: { roleId },
  });
