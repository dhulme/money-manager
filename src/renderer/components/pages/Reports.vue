<template>
  <VCard>
    <VCardTitle>
      Reports
      <VSpacer />
    </VCardTitle>
    <VCardText>
      <VList>
        <VListItem
          v-for="report in reports"
          :key="report.id"
          @click="openReport(report.id)"
        >
          <VListItemContent>
            <VListItemTitle>
              {{ report.name }}
            </VListItemTitle>
          </VListItemContent>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
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
