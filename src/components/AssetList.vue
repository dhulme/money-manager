<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Account</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="asset in assets" :key="asset.name" @click="openAsset(asset.id)">
          <td>{{ asset.name }}</td>
          <td>{{ asset.balance | currency }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  export default {
    computed: {
      assets() {
        return this.$project.assets();
      },
    },
    methods: {
      openAsset(assetId) {
        this.$router.push({
          name: 'asset',
          params: {
            assetId,
          },
        });
      },
    },
  };
</script>
