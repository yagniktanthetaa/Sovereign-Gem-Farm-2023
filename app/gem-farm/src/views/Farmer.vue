<template>
  <ConfigPane />
  <div v-if="!wallet" class="text-center text-white text-2xl">
    Please connect solana wallet
  </div>
  <div v-else>
    <!--farm address-->
    <div class="nes-container with-title mb-10 hidden">
      <p class="text-4xl text-white">
        Connect to a Farm : Paste
        ("J5n56CwU1txay7YP25Z6HUNQkfox1aXUr7nD4UZafpSv")
      </p>
      <div class="nes-field mb-5">
        <!-- <label for="farm text-white">Farm address:</label> -->
        <input id="farm" class="nes-input" v-model="farm" />
      </div>
    </div>
    <!-- 73EtAt7ze1Az3WAyp3m5kGKf1WbvdNfhYE58usRw8gi9 -->
    <!--OLD FTwvfksvx1CK8gZLxfL7WLZ2Uo2wtpQSsntTEvmeDL84 -->
    <!-- NEW-FINAL-03-02-2023 J5n56CwU1txay7YP25Z6HUNQkfox1aXUr7nD4UZafpSv -->
    <div v-if="farmerAcc">
      <FarmerDisplay
        :key="farmerAcc"
        :farm="farm"
        :farmAcc="farmAcc"
        :farmer="farmer"
        :farmerAcc="farmerAcc"
        class="mb-10"
        @refresh-farmer="handleRefreshFarmer"
      />
      <div class="flex justify-center items-center gap-4">
        <div class="text-white text-2xl my-5">
          Road to Staking
          <ul>
            <li>Step 1: Select NFTs</li>
            <li>Step 2: Move NFTs to vault</li>
            <li>Step 3: Lock NFT</li>
            <li>Step 4: Begin Staking</li>
          </ul>
        </div>

        <div class="text-white text-2xl my-5">
          Road to Unstaking

          <ul>
            <li>Step 1: End Staking</li>
            <li>Step 2: End Coolown</li>
            <li>Step 3: Select NFTs</li>
            <li>Step 4: Move NFTs to wallet</li>
            <li>Step 5: Unlock NFT</li>
          </ul>
        </div>
      </div>

      <Vault
        :key="farmerAcc"
        class="mb-10"
        :vault="farmerAcc.vault.toBase58()"
        @selected-wallet-nft="handleNewSelectedNFT"
      >
        <!-- <button
          v-if="farmerState === 'staked' && selectedNFTs.length > 0"
          class="button-style mr-5"
          @click="addGems"
        >
          Move Gems
        </button> -->

        <button
          v-if="farmerState === 'unstaked'"
          class="button-style mr-5 transition ease-in-out delay-150 bg-blue-500 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 duration-300"
          @click="beginStaking"
        >
          Begin Staking
        </button>

        <button
          v-if="farmerState === 'staked'"
          class="button-style mr-5"
          @click="endStaking"
        >
          End staking
        </button>
        <!-- <button class="button-style mr-5">Upgrade NFT Step 1</button> -->
        <button
          v-if="farmerState === 'pendingCooldown'"
          class="button-style mr-5"
          @click="endStaking"
        >
          End cooldown
        </button>
        <button class="button-style" @click="claim">
          Claim {{ availableA / 1000000000 }} $SQRE
        </button>
      </Vault>
    </div>
    <div v-else>
      <div class="w-full text-center mb-5 text-white text-2xl">
        If you are staking Sovereign NFT first time then only Create New Farmer
      </div>
      <div class="w-full text-center">
        <button
          class="button-style transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-white hover:text-yellow-700 duration-300"
          @click="initFarmer"
        >
          New Staker
        </button>
      </div>
    </div>
  </div>
  <!-- <div class="flex justify-between items-center gap-10">
    <div class="style_stepBox__gwDDS">
      <img :src="selectedImage" alt="" class="w-72" />
      <img src="../assets/king.svg" alt="" class="w-48" id="main_img" />
    </div>
    <div>
      <img src="../assets/plus.svg" alt="" class="w-48" />
    </div>
    <div class="style_stepBox__gwDDS">
      <img src="../assets/layerchirag.svg" alt="" class="w-80" />
    </div>
    <div>
      <img src="../assets/equals.svg" alt="" class="w-48" />
    </div>
    <div class="style_stepBox__gwDDS">
      <img src="../assets/frame.svg" alt="" class="" />
    </div>
  </div>
  <div class="my-10 flex justify-between">
    <div class="flex justify-start">
      <button class="button-style1" @click="getNFT">get NFT</button>
    </div>
    <div class="flex justify-center">
      <button class="button-style1" @click="sendTokens">Send 1000 SQRE Token</button>
    </div>
    <div class="flex justify-end">
      <button class="button-style1" @click="updateNFT">Upgrade NFT</button>
    </div>
  </div> -->
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref, watch } from 'vue';
import useWallet from '@/composables/wallet';
import useCluster from '@/composables/cluster';
import { initGemFarm } from '@/common/gem-farm';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import ConfigPane from '@/components/ConfigPane.vue';
import FarmerDisplay from '@/components/gem-farm/FarmerDisplay.vue';
import Vault from '@/components/gem-bank/Vault.vue';
import { INFT } from '@/common/web3/NFTget';
import axios from 'axios';
import NFTCard from '@/components/gem-bank/NFTCard.vue';
import NFTGrid from '@/components/gem-bank/NFTGrid.vue';

import * as solanaWeb3 from '@solana/web3.js'; // 1.36.0
import * as splToken from '@solana/spl-token'; // 0.1.8

import {
  getNFTMetadataForMany,
  getNFTsByOwner,
  getNFTMetadata,
} from '@/common/web3/NFTget';
import { programs } from '@metaplex/js';
import { findFarmerPDA, stringifyPKsAndBNs } from '@gemworks/gem-farm-ts';

declare global {
  interface Window {
    solana: any;
  }
}

export default defineComponent({
  components: { Vault, FarmerDisplay, ConfigPane, NFTCard, NFTGrid },
  data() {
    return {
      selectedImage: '',
      selectedNFTs: [],
    };
  },

  methods: {
    getNFT(e: any) {
      console.log('getNFT');

      // for (const nft of selectedNFTs.value) {
      //       console.log('nftData...............', nft);
      //     }

      console.log('selectedImage.....', this.selectedImage);
      this.selectedNFTs.map((nft: any) => {
        this.selectedImage = (nft.externalMetadata as any)?.image;
        console.log('nft....', this.selectedImage);
      });
    },
  },

  props: {
    nft: { type: Object, required: true },
  },
  setup(props) {
    const { wallet, getWallet } = useWallet();
    const { cluster, getConnection } = useCluster();
    let gf: any;

    watch([wallet, cluster], async () => {
      await freshStart();
    });

    //needed in case we switch in from another window
    onMounted(async () => {
      await freshStart();
    });

    //
    // --------------------------------------- farmer details
    const farm = ref<string>(
      process.env.VUE_APP_GEM_FARM_PK ||
        'J5n56CwU1txay7YP25Z6HUNQkfox1aXUr7nD4UZafpSv'
    );
    const farmAcc = ref<any>();
    const farmerIdentity = ref<string>();
    const farmerAcc = ref<any>();
    const farmerState = ref<string>();
    const availableA = ref<string>();
    const availableB = ref<string>();

    //auto loading for when farm changes
    watch(farm, async () => {
      await freshStart();
    });

    const updateAvailableRewards = async () => {
      availableA.value = farmerAcc.value.rewardA.accruedReward
        .sub(farmerAcc.value.rewardA.paidOutReward)
        .toString();
      availableB.value = farmerAcc.value.rewardB.accruedReward
        .sub(farmerAcc.value.rewardB.paidOutReward)
        .toString();
    };

    var updateNFT = async () => {
      console.log('updateNFT');
      await Promise.all(
        selectedNFTs.value.map((nft) => {
          const mint = nft.mint;
          console.log('mint is', mint.toBase58());
          axios
            .post('http://192.168.29.223:3003/updateNFT', {
              nftToken: mint,
            })
            .then((response: any) => {
              console.log(response.data);
            });
        })
      );
    };

    const fetchFarn = async () => {
      farmAcc.value = await gf.fetchFarmAcc(new PublicKey(farm.value!));
      console.log(
        `farm found at ${farm.value}:`,
        stringifyPKsAndBNs(farmAcc.value)
      );
    };

    const fetchFarmer = async () => {
      const [farmerPDA] = await findFarmerPDA(
        new PublicKey(farm.value!),
        getWallet()!.publicKey!
      );
      farmerIdentity.value = getWallet()!.publicKey?.toBase58();
      farmerAcc.value = await gf.fetchFarmerAcc(farmerPDA);
      farmerState.value = gf.parseFarmerState(farmerAcc.value);
      await updateAvailableRewards();
      console.log(
        `farmer found at ${farmerIdentity.value}:`,
        stringifyPKsAndBNs(farmerAcc.value)
      );
    };

    const freshStart = async () => {
      if (getWallet() && getConnection()) {
        gf = await initGemFarm(getConnection(), getWallet()!);
        farmerIdentity.value = getWallet()!.publicKey?.toBase58();
        //reset stuff
        farmAcc.value = undefined;
        farmerAcc.value = undefined;
        farmerState.value = undefined;
        availableA.value = undefined;
        availableB.value = undefined;
        try {
          await fetchFarn();
          await fetchFarmer();
        } catch (e) {
          console.log(`farm with PK ${farm.value} not found :(`);
        }
      }
    };

    const initFarmer = async () => {
      await gf.initFarmerWallet(new PublicKey(farm.value!));
      await fetchFarmer();
    };

    // --------------------------------------- staking
    const beginStaking = async () => {
      await gf.stakeWallet(new PublicKey(farm.value!));
      await fetchFarmer();
      selectedNFTs.value = [];
    };
    const endStaking = async () => {
      await gf.unstakeWallet(new PublicKey(farm.value!));
      await fetchFarmer();
      selectedNFTs.value = [];
    };
    const claim = async () => {
      await gf.claimWallet(
        new PublicKey(farm.value!),
        new PublicKey(farmAcc.value.rewardA.rewardMint!),
        new PublicKey(farmAcc.value.rewardB.rewardMint!)
      );
      await fetchFarmer();
    };
    const handleRefreshFarmer = async () => {
      await fetchFarmer();
    };
    // --------------------------------------- adding extra gem
    const selectedNFTs = ref<INFT[]>([]);
    const handleNewSelectedNFT = (newSelectedNFTs: INFT[]) => {
      console.log(`selected ${newSelectedNFTs.length} NFTs`);
      selectedNFTs.value = newSelectedNFTs;
      console.log('newnft........', newSelectedNFTs);
      console.log(
        'getWallet()!.publicKey?.toBase58()',
        getWallet()!.publicKey?.toBase58()
      );
    };
    // const handleNewSelectedNFT = (newSelectedNFTs: INFT[]) => {
    //   for (let i = 0; i < newSelectedNFTs.length; i++) {
    //     selectedNFTs.value.push(newSelectedNFTs[i]);
    //     console.log('newSelectedNFTs....', newSelectedNFTs);
    //     console.log(
    //       'shift',
    //       newSelectedNFTs.length === 2 && newSelectedNFTs.shift()
    //     );
    //     console.log('newShiftNFTs....', newSelectedNFTs);
    //   }
    //   console.log(`selected ${newSelectedNFTs.length} NFTs`);
    // };
    const addSingleGem = async (
      gemMint: PublicKey,
      gemSource: PublicKey,
      creator: PublicKey
    ) => {
      await gf.flashDepositWallet(
        new PublicKey(farm.value!),
        '1',
        gemMint,
        gemSource,
        creator
      );
      await fetchFarmer();
    };
    const addGems = async () => {
      await Promise.all(
        selectedNFTs.value.map((nft) => {
          const creator = new PublicKey(
            //todo currently simply taking the 1st creator
            (nft.onchainMetadata as any).data.creators[0].address
          );
          console.log('creator is', creator.toBase58());
          addSingleGem(nft.mint, nft.pubkey!, creator);
        })
      );
      console.log(
        `added another ${selectedNFTs.value.length} gems into staking vault`
      );
    };

    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl('devnet'),
      'confirmed'
    );

    const sendTokens = async () => {
      // USDC's token address on devnet.
      const SOLANA_DEVNET_USDC_PUBKEY =
        'EKgrBuvo46AF19pFefxnXKCaVc8MEW5KSp9gZkaTYi5T';

      console.log('window', window);
      console.log(window.solana);
      console.log(window.solana.publicKey);
      console.log(window.solana.publicKey.toBase58());

      // Convert to object type.
      const fromWallet = new solanaWeb3.PublicKey(window.solana.publicKey);

      const toWallet = new solanaWeb3.PublicKey(
        '8Qiw7S7nQJpbetDgywdsfnkFAz2gaJKWqotYveZhsafn'
      );

      const USDC_pubkey = new solanaWeb3.PublicKey(SOLANA_DEVNET_USDC_PUBKEY);

      // Create token class.
      // var USDC_Token = new splToken.Token(
      //   connection,
      //   USDC_pubkey,
      //   splToken.TOKEN_PROGRAM_ID,
      //   fromWallet
      // );

      // // Create token accounts for USDC token if they don't exist.
      // const fromTokenAccount = await USDC_Token.getOrCreateAssociatedAccountInfo(
      //   fromWallet
      // );
      // // Get the derived address of the destination wallet which will hold the custom token
      // const associatedDestinationTokenAddr =
      //   await splToken.Token.getAssociatedTokenAddress(
      //     USDC_Token.associatedProgramId,
      //     USDC_Token.programId,
      //     USDC_pubkey,
      //     toWallet
      //   );
      // console.log(associatedDestinationTokenAddr);
      // const receiverAccount = await connection.getAccountInfo(
      //   associatedDestinationTokenAddr
      // );
      // console.log(receiverAccount);
      // if (receiverAccount === null) {
      //   console.log("Account doesn't have USDC Token. Creating token address.");
      //   // Add token transfer instructions to transaction.
      //   const transaction = new solanaWeb3.Transaction().add(
      //     splToken.Token.createAssociatedTokenAccountInstruction(
      //       USDC_Token.associatedProgramId,
      //       USDC_Token.programId,
      //       USDC_pubkey,
      //       associatedDestinationTokenAddr,
      //       toWallet,
      //       fromWallet
      //     )
      //   );
      //   // Fee payer of the transaction.
      //   transaction.feePayer = fromWallet;
      //   // Latest blockhash.
      //   transaction.recentBlockhash = (
      //     await connection.getLatestBlockhash()
      //   ).blockhash;
      //   // Request creator to sign the transaction.
      //   const signed = await window.solana.signTransaction(transaction);
      //   // Signature generated.
      //   const signature = await connection.sendRawTransaction(signed.serialize());
      //   console.log(signature);
      //   // Confirm whether the transaction's confirmed or not.
      //   const confirmation = await connection.confirmTransaction(signature);
      //   console.log(confirmation);
      // }
      // const toTokenAccount = await USDC_Token.getOrCreateAssociatedAccountInfo(
      //   toWallet
      // );
      // // Add token transfer instructions to transaction.
      // const transaction = new solanaWeb3.Transaction().add(
      //   splToken.Token.createTransferInstruction(
      //     splToken.TOKEN_PROGRAM_ID,
      //     fromTokenAccount.address,
      //     toTokenAccount.address,
      //     fromWallet,
      //     [],
      //     1000 * 1000000000
      //   )
      // );
      // // Fee payer of the transaction.
      // transaction.feePayer = fromWallet;
      // // Latest blockhash.
      // transaction.recentBlockhash = (
      //   await connection.getLatestBlockhash()
      // ).blockhash;
      // // Request creator to sign the transaction.
      // const signed = await window.solana.signTransaction(transaction);
      // // Signature generated.
      // const signature = await connection.sendRawTransaction(signed.serialize());
      // console.log(signature);
      // // Confirm whether the transaction went through or not.
      // const confirmation = await connection.confirmTransaction(signature);
      // console.log(confirmation);
    };

    return {
      wallet,
      farm,
      farmAcc,
      farmer: farmerIdentity,
      farmerAcc,
      farmerState,
      availableA,
      availableB,
      initFarmer,
      beginStaking,
      endStaking,
      updateNFT,
      claim,
      handleRefreshFarmer,
      selectedNFTs,
      handleNewSelectedNFT,
      addGems,
      sendTokens,
    };
  },
});
</script>
<style scoped>
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

.button-style1 {
  width: 425px;
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
}

.style_stepBox__gwDDS {
  margin: 40px 0 0 0;
  padding: 14px;
  width: 30%;
  height: 500px;
  background: #242424;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
