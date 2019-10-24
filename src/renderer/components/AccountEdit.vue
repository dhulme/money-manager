<template>
  <VCard v-hotkey.close="close">
    <VCardTitle class="headline">Edit {{ account.name }}</VCardTitle>
    <VCardText>
      <VForm ref="form" v-model="valid" lazy-validation> </VForm>
    </VCardText>
  </VCard>
</template>
