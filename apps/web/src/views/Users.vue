<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useRolesStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Select from '@/components/ui/select.vue'
import Label from '@/components/ui/label.vue'
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
import { Plus, Search, Pencil, Trash2, Loader2, X, Filter, RotateCcw } from 'lucide-vue-next'
import { Permissions, type User, type UserStatus } from '@starter/shared'
import { formatDate } from '@/lib/utils'

const usersStore = useUsersStore()
const rolesStore = useRolesStore()
const authStore = useAuthStore()
const toast = useToast()

const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const isDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isSubmitting = ref(false)
const editingUser = ref<User | null>(null)
const userToDelete = ref<User | null>(null)

const formData = ref({
  name: '',
  email: '',
  password: '',
  status: 'ACTIVE' as UserStatus,
  roleId: '',
})

const formErrors = ref<Record<string, string>>({})

const canCreate = computed(() => authStore.can(Permissions.USERS_CREATE))
const canUpdate = computed(() => authStore.can(Permissions.USERS_UPDATE))
const canDelete = computed(() => authStore.can(Permissions.USERS_DELETE))

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
]

const roleOptions = computed(() => [
  { value: '', label: 'All Roles' },
  ...rolesStore.roles.map(r => ({ value: r.id, label: r.name })),
])

const userRoleOptions = computed(() =>
  rolesStore.roles.map(r => ({ value: r.id, label: r.name }))
)

onMounted(() => {
  usersStore.fetchUsers()
  rolesStore.fetchRoles()
})

const handleSearch = () => {
  usersStore.fetchUsers({
    search: search.value,
    roleId: roleFilter.value,
    status: statusFilter.value as UserStatus,
    page: 1,
  })
}

const openCreateDialog = () => {
  editingUser.value = null
  formData.value = {
    name: '',
    email: '',
    password: '',
    status: 'ACTIVE',
    roleId: '',
  }
  formErrors.value = {}
  isDialogOpen.value = true
}

const openEditDialog = (user: User) => {
  editingUser.value = user
  formData.value = {
    name: user.name,
    email: user.email,
    password: '',
    status: user.status,
    roleId: user.roleId || '',
  }
  formErrors.value = {}
  isDialogOpen.value = true
}

const openDeleteDialog = (user: User) => {
  userToDelete.value = user
  isDeleteDialogOpen.value = true
}

const validateForm = () => {
  formErrors.value = {}
  
  if (!formData.value.name || formData.value.name.length < 2) {
    formErrors.value.name = 'Name must be at least 2 characters'
  }
  
  if (!formData.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    formErrors.value.email = 'Valid email is required'
  }
  
  if (!editingUser.value && (!formData.value.password || formData.value.password.length < 6)) {
    formErrors.value.password = 'Password must be at least 6 characters'
  }
  
  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    if (editingUser.value) {
      const updateData: any = {
        name: formData.value.name,
        email: formData.value.email,
        status: formData.value.status,
        roleId: formData.value.roleId || null,
      }
      if (formData.value.password) {
        updateData.password = formData.value.password
      }
      await usersStore.updateUser(editingUser.value.id, updateData)
      toast.success('User updated successfully')
    } else {
      await usersStore.createUser({
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password,
        status: formData.value.status,
        roleId: formData.value.roleId || null,
      })
      toast.success('User created successfully')
    }
    
    isDialogOpen.value = false
    usersStore.fetchUsers()
  } catch (error) {
    toast.error('Something went wrong')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (!userToDelete.value) return
  
  isSubmitting.value = true
  
  try {
    await usersStore.deleteUser(userToDelete.value.id)
    toast.success('User deleted successfully')
    isDeleteDialogOpen.value = false
    usersStore.fetchUsers()
  } catch (error) {
    toast.error('Failed to delete user')
  } finally {
    isSubmitting.value = false
  }
}

const handlePageChange = (newPage: number) => {
  usersStore.fetchUsers({
    search: search.value,
    roleId: roleFilter.value,
    status: statusFilter.value as UserStatus,
    page: newPage,
  })
}

const hasActiveFilters = computed(() => {
  return search.value || roleFilter.value || statusFilter.value
})

const resetFilters = () => {
  search.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  handleSearch()
}

const clearSearch = () => {
  search.value = ''
  handleSearch()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Users</h1>
      <Button v-if="canCreate" @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        Add User
      </Button>
    </div>

    <!-- Filters -->
    <Card class="bg-muted/50">
      <CardContent class="pt-4 pb-4">
        <div class="flex flex-col gap-4">
          <!-- Filter Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter class="h-4 w-4" />
              <span>Filters</span>
              <Badge v-if="hasActiveFilters" variant="secondary" class="ml-2 text-xs">
                Active
              </Badge>
            </div>
            <Button
              v-if="hasActiveFilters"
              variant="ghost"
              size="sm"
              class="h-8 text-muted-foreground hover:text-foreground"
              @click="resetFilters"
            >
              <RotateCcw class="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          <!-- Filter Inputs -->
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Search -->
            <div class="space-y-1.5">
              <Label class="text-xs font-medium text-muted-foreground">Search</Label>
              <div class="relative">
                <Search class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  v-model="search"
                  placeholder="Name or email..."
                  class="h-9 pl-9 pr-8"
                  @keyup.enter="handleSearch"
                />
                <button
                  v-if="search"
                  type="button"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  @click="clearSearch"
                >
                  <X class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <!-- Role Filter -->
            <div class="space-y-1.5">
              <Label class="text-xs font-medium text-muted-foreground">Role</Label>
              <Select
                v-model="roleFilter"
                :options="roleOptions"
                @update:model-value="handleSearch"
              />
            </div>

            <!-- Status Filter -->
            <div class="space-y-1.5">
              <Label class="text-xs font-medium text-muted-foreground">Status</Label>
              <Select
                v-model="statusFilter"
                :options="statusOptions"
                @update:model-value="handleSearch"
              />
            </div>

            <!-- Apply Button -->
            <div class="space-y-1.5 flex flex-col justify-end">
              <Label class="text-xs font-medium text-transparent select-none">Action</Label>
              <Button size="sm" class="h-9" @click="handleSearch">
                <Search class="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Users Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="usersStore.isLoading">
              <TableCell colspan="6" class="text-center py-8">
                <Loader2 class="mx-auto h-6 w-6 animate-spin" />
              </TableCell>
            </TableRow>
            <TableRow v-else-if="!usersStore.users.length">
              <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
            <TableRow v-for="user in usersStore.users" :key="user.id">
              <TableCell class="font-medium">{{ user.name }}</TableCell>
              <TableCell>{{ user.email }}</TableCell>
              <TableCell>
                <Badge v-if="user.role" variant="secondary">{{ user.role.name }}</Badge>
                <span v-else class="text-muted-foreground">-</span>
              </TableCell>
              <TableCell>
                <Badge :variant="user.status === 'ACTIVE' ? 'success' : 'secondary'">
                  {{ user.status }}
                </Badge>
              </TableCell>
              <TableCell>{{ formatDate(user.createdAt) }}</TableCell>
              <TableCell class="text-right">
                <Button
                  v-if="canUpdate"
                  variant="ghost"
                  size="icon"
                  @click="openEditDialog(user)"
                >
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button
                  v-if="canDelete"
                  variant="ghost"
                  size="icon"
                  @click="openDeleteDialog(user)"
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Pagination -->
    <div v-if="usersStore.totalPages > 1" class="flex justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="usersStore.page === 1"
        @click="handlePageChange(usersStore.page - 1)"
      >
        Previous
      </Button>
      <span class="flex items-center px-4 text-sm">
        Page {{ usersStore.page }} of {{ usersStore.totalPages }}
      </span>
      <Button
        variant="outline"
        size="sm"
        :disabled="usersStore.page === usersStore.totalPages"
        @click="handlePageChange(usersStore.page + 1)"
      >
        Next
      </Button>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:open="isDialogOpen"
      :title="editingUser ? 'Edit User' : 'Create User'"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Name</label>
          <Input v-model="formData.name" :error="formErrors.name" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Email</label>
          <Input v-model="formData.email" type="email" :error="formErrors.email" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">
            Password {{ editingUser ? '(leave blank to keep unchanged)' : '' }}
          </label>
          <Input
            v-model="formData.password"
            type="password"
            :error="formErrors.password"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Status</label>
          <Select
            v-model="formData.status"
            :options="[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Role</label>
          <Select
            v-model="formData.roleId"
            :options="[{ value: '', label: 'No Role' }, ...userRoleOptions]"
          />
        </div>
        <div class="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" @click="isDialogOpen = false">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingUser ? 'Update' : 'Create' }}
          </Button>
        </div>
      </form>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:open="isDeleteDialogOpen"
      title="Delete User"
      description="Are you sure you want to delete this user? This action cannot be undone."
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
