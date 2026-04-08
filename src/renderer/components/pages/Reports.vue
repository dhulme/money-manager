<template>
  <v-card>
    <v-card-title>
      Reports
      <v-spacer />
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item
          v-for="report in reports"
          :key="report.id"
          @click="openReport(report.id)"
        >
          <v-list-item-title>
            {{ report.name }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      reports: [
        {
          name: 'Gift Aid',
          id: 'giftAid',
        },
      ],
    };
  },
  methods: {
    openReport(id) {
      this.$router.push({
        name: 'report',
        params: {
          reportId: id,
        },
      });
    },
  },
};
</script>
