<template>
  <div class="nes-container with-title text-white text-xl">
    <!-- <p class="text-white  flex justify-center text-6xl"> Staking </p> -->
    <!-- <div class="mb-2">
      state:
      <p class="inline-block ">
        {{ parseFarmerState(farmerAcc) }}
      </p>
    </div> -->
    <div class="flex justify-between mt-10">
      <div>
        <div class="flex justify-center">
          <h1 class="text-base">Wallet Address</h1>
        </div>
        <div class="font">
          {{
            farmerAcc?.identity.toBase58().slice(0, 4) +
            '....' +
            farmerAcc?.identity.toBase58().slice(-4)
          }}
        </div>
      </div>
      <div>
        <div class="flex justify-center text-base">Sovereign Staked</div>
        <div class="font">{{ farmerAcc?.gemsStaked }}</div>
      </div>
      <div>
        <div class="flex-1 mr-5 text-blue-500">
          <FarmerRewardDisplay
            :key="farmerAcc?.rewardA"
            :farmReward="farmAcc?.rewardA"
            :reward="farmerAcc?.rewardA"
            title="Reward A"
          />
        </div>
      </div>
    </div>
    <!-- <div class="mb-2">Associated vault: {{ farmerAcc?.vault.toBase58() }}</div> -->
    <!-- <div class="mb-2">Soveregin staked: {{ farmerAcc.gemsStaked }}</div> -->
    <!-- <div class="mb-2">
      Min staking ends: {{ parseDate(farmerAcc.minStakingEndsTs) }}
    </div>
    <div class="mb-5">
      Cooldown ends: {{ parseDate(farmerAcc.cooldownEndsTs) }}
    </div> -->

    <div class="flex mb-5">
      <!-- <div class="flex-1 mr-5 text-blue-500">
        <FarmerRewardDisplay :key="farmerAcc.rewardA" :farmReward="farmAcc.rewardA" :reward="farmerAcc.rewardA"
          title="Reward A" />
      </div> -->
      <!-- <div class="flex-1">
        <FarmerRewardDisplay :key="farmerAcc.rewardB" :farmReward="farmAcc.rewardB" :reward="farmerAcc.rewardB"
          title="Reward B" />
      </div> -->
    </div>
    <button class="button-style mb-5" @click="refreshFarmer">
      Refresh account
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import FarmerRewardDisplay from '@/components/gem-farm/FarmerRewardDisplay.vue';
import useWallet from '@/composables/wallet';
import useCluster from '@/composables/cluster';
import { initGemFarm } from '@/common/gem-farm';
import { PublicKey } from '@solana/web3.js';
import { parseDate } from '@/common/util';

export default defineComponent({
  components: { FarmerRewardDisplay },
  props: {
    farm: String,
    farmAcc: Object,
    farmer: String,
    farmerAcc: Object,
  },
  emits: ['refresh-farmer'],
  setup(props, ctx) {
    const { wallet, getWallet } = useWallet();
    const { cluster, getConnection } = useCluster();

    let gf: any;
    watch([wallet, cluster], async () => {
      gf = await initGemFarm(getConnection(), getWallet()!);
    });
    //need an onmounted hook because this component isn't yet mounted when wallet/cluster are set
    onMounted(async () => {
      if (getWallet() && getConnection()) {
        gf = await initGemFarm(getConnection(), getWallet()!);
      }
    });

    // --------------------------------------- display farmer
    // todo ideally should be using one from client, but n/a during render
    const parseFarmerState = (farmer: any): string => {
      return Object.keys(farmer.state)[0];
    };

    const refreshFarmer = async () => {
      await gf.refreshFarmerWallet(
        new PublicKey(props.farm!),
        new PublicKey(props.farmer!)
      );
      ctx.emit('refresh-farmer');
    };

    return {
      refreshFarmer,
      parseFarmerState,
      parseDate,
    };
  },
});
</script>

<style scoped>
.font {
  font-style: normal;
  font-weight: 500;
  font-size: 36px;
  line-height: 43px;
  text-align: center;
  color: #a07d3e;
}
.button-style {
  width: 165px;
  height: 53px;
  background: #a07d3e;
  clip-path: polygon(100% 0, 100% 49%, 82% 100%, 0 100%, 0 0);
  border: none;
  outline: none;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 19px;
  text-align: center;
  color: #ffffff;
  margin: 0px 20px;
}
#app {
  cursor: pointer;
}
</style>
