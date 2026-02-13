<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRolesStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Dialog from '@/components/ui/dialog.vue'
import Badge from '@/components/ui/badge.vue'
import Card from '@/components/ui/card.vue'
import CardHeader from '@/components/ui/card-header.vue'
import CardTitle from '@/components/ui/card-title.vue'
import CardContent from '@/components/ui/card-content.vue'
import Table from '@/components/ui/table.vue'
import TableHeader from '@/components/ui/table-header.vue'
import TableBody from '@/components/ui/table-body.vue'
import TableRow from '@/components/ui/table-row.vue'
import TableHead from '@/components/ui/table-head.vue'
import TableCell from '@/components/ui/table-cell.vue'
import { Plus, Pencil, Trash2, Loader2, Shield } from 'lucide-vue-next'
import { Permissions, type Role, type Permission } from '@starter/shared'
import { formatDate } from '@/lib/utils'

const rolesStore = useRolesStore()
const authStore = useAuthStore()
const toast = useToast()

const isDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isSubmitting = ref(false)
const editingRole = ref<Role | null>(null)
const roleToDelete = ref<Role | null>(null)

const formData = ref({
  name: '',
  slug: '',
  permissions: [] as Permission[],
})

const formErrors = ref<Record<string, string>>({})

const canCreate = computed(() => authStore.can(Permissions.ROLES_CREATE))
const canUpdate = computed(() => authStore.can(Permissions.ROLES_UPDATE))
const canDelete = computed(() => authStore.can(Permissions.ROLES_DELETE))

const allPermissions = computed(() => {
  return rolesStore.permissions.map(p => ({
    value: p,
    label: p.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    category: p.split('.')[0],
  }))
})

const groupedPermissions = computed(() => {
  const groups: Record<string, typeof allPermissions.value> = {}
  allPermissions.value.forEach(p => {
    if (!groups[p.category]) groups[p.category] = []
    groups[p.category].push(p)
  })
  return groups
})

onMounted(() => {
  rolesStore.fetchRoles()
  rolesStore.fetchPermissions()
})

const openCreateDialog = () => {
  editingRole.value = null
  formData.value = {
    name: '',
    slug: '',
    permissions: [],
  }
  formErrors.value = {}
  isDialogOpen.value = true
}

const openEditDialog = (role: Role) => {
  editingRole.value = role
  formData.value = {
    name: role.name,
    slug: role.slug,
    permissions: [...role.permissions],
  }
  formErrors.value = {}
  isDialogOpen.value = true
}

const openDeleteDialog = (role: Role) => {
  roleToDelete.value = role
  isDeleteDialogOpen.value = true
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const validateForm = () => {
  formErrors.value = {}
  
  if (!formData.value.name || formData.value.name.length < 2) {
    formErrors.value.name = 'Name must be at least 2 characters'
  }
  
  if (!editingRole.value) {
    if (!formData.value.slug || formData.value.slug.length < 2) {
      formErrors.value.slug = 'Slug must be at least 2 characters'
    } else if (!/^[a-z0-9-]+$/.test(formData.value.slug)) {
      formErrors.value.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
  }
  
  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    if (editingRole.value) {
      await rolesStore.updateRole(editingRole.value.id, {
        name: formData.value.name,
        permissions: formData.value.permissions,
      })
      toast.success('Role updated successfully')
    } else {
      const slug = formData.value.slug || generateSlug(formData.value.name)
      await rolesStore.createRole({
        name: formData.value.name,
        slug,
        permissions: formData.value.permissions,
      })
      toast.success('Role created successfully')
    }
    
    isDialogOpen.value = false
    rolesStore.fetchRoles()
  } catch (error) {
    toast.error('Something went wrong')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (!roleToDelete.value) return
  
  isSubmitting.value = true
  
  try {
    await rolesStore.deleteRole(roleToDelete.value.id)
    toast.success('Role deleted successfully')
    isDeleteDialogOpen.value = false
    rolesStore.fetchRoles()
  } catch (error) {
    toast.error('Failed to delete role')
  } finally {
    isSubmitting.value = false
  }
}

const togglePermission = (permission: Permission) => {
  const index = formData.value.permissions.indexOf(permission)
  if (index > -1) {
    formData.value.permissions.splice(index, 1)
  } else {
    formData.value.permissions.push(permission)
  }
}

const toggleAllInCategory = (category: string, checked: boolean) => {
  const categoryPerms = groupedPermissions.value[category].map(p => p.value)
  if (checked) {
    // Add all permissions from this category
    categoryPerms.forEach(p => {
      if (!formData.value.permissions.includes(p)) {
        formData.value.permissions.push(p)
      }
    })
  } else {
    // Remove all permissions from this category
    formData.value.permissions = formData.value.permissions.filter(
      p => !categoryPerms.includes(p)
    )
  }
}

const isCategoryFullySelected = (category: string) => {
  const categoryPerms = groupedPermissions.value[category].map(p => p.value)
  return categoryPerms.every(p => formData.value.permissions.includes(p))
}

const isCategoryPartiallySelected = (category: string) => {
  const categoryPerms = groupedPermissions.value[category].map(p => p.value)
  const selectedCount = categoryPerms.filter(p => formData.value.permissions.includes(p)).length
  return selectedCount > 0 && selectedCount < categoryPerms.length
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Roles</h1>
      <Button v-if="canCreate" @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        Add Role
      </Button>
    </div>

    <!-- Roles Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="rolesStore.isLoading">
              <TableCell colspan="5" class="text-center py-8">
                <Loader2 class="mx-auto h-6 w-6 animate-spin" />
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!rolesStore.roles.length">
              <TableCell colspan="5" class="text-center py-8 text-muted-foreground">
                No roles found
              </TableCell>
            </TableRow>
            <TableRow v-for="role in rolesStore.roles" :key="role.id">
              <TableCell class="font-medium">
                <div class="flex items-center gap-2">
                  <Shield class="h-4 w-4 text-primary" />
                  {{ role.name }}
                </div>
              </TableCell>
              <TableCell>
                <code class="rounded bg-muted px-2 py-1 text-xs">{{ role.slug }}</code>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="perm in role.permissions.slice(0, 3)"
                    :key="perm"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ perm }}
                  </Badge>
                  <Badge v-if="role.permissions.length > 3" variant="outline">
                    +{{ role.permissions.length - 3 }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{{ formatDate(role.createdAt) }}</TableCell>
              <TableCell class="text-right">
                <Button
                  v-if="canUpdate"
                  variant="ghost"
                  size="icon"
                  @click="openEditDialog(role)"
                >
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button
                  v-if="canDelete && !['super-admin', 'admin', 'viewer'].includes(role.slug)"
                  variant="ghost"
                  size="icon"
                  @click="openDeleteDialog(role)"
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:open="isDialogOpen"
      :title="editingRole ? 'Edit Role' : 'Create Role'"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Name</label>
          <Input
            v-model="formData.name"
            :error="formErrors.name"
            @blur="!editingRole && (formData.slug = generateSlug(formData.name))"
          />
        </div>
        <div v-if="!editingRole" class="space-y-2">
          <label class="text-sm font-medium">Slug</label>
          <Input
            v-model="formData.slug"
            placeholder="auto-generated-from-name"
            :error="formErrors.slug"
          />
        </div>
        
        <!-- Permissions -->
        <div class="space-y-3">
          <label class="text-sm font-medium">Permissions</label>
          <div class="max-h-[300px] overflow-y-auto space-y-4 rounded-md border p-4">
            <div v-for="(perms, category) in groupedPermissions" :key="category">
              <div class="flex items-center gap-2 mb-2 pb-2 border-b">
                <input
                  type="checkbox"
                  :checked="isCategoryFullySelected(category)"
                  :indeterminate="isCategoryPartiallySelected(category)"
                  @change="toggleAllInCategory(category, ($event.target as HTMLInputElement).checked)"
                  class="h-4 w-4 rounded border-gray-300"
                />
                <span class="font-semibold capitalize">{{ category }}</span>
              </div>
              <div class="ml-6 grid grid-cols-2 gap-2">
                <label
                  v-for="perm in perms"
                  :key="perm.value"
                  class="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :checked="formData.permissions.includes(perm.value)"
                    @change="togglePermission(perm.value)"
                    class="h-4 w-4 rounded border-gray-300"
                  />
                  <span class="capitalize">{{ perm.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" @click="isDialogOpen = false">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingRole ? 'Update' : 'Create' }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:open="isDeleteDialogOpen"
      title="Delete Role"
      description="Are you sure you want to delete this role? This action cannot be undone."
    >
      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="isDeleteDialogOpen = false">
          Cancel
        </Button>
        <Button
          variant="destructive"
          :disabled="isSubmitting"
          @click="handleDelete"
        >
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          Delete
        </Button>
      </div>
    </Dialog>
  </div>
</template>
