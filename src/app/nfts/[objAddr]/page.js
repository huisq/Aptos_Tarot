"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../../../../components/Navbar";
import NftShareContainer from "../../../../components/NftShareContainer";
import Cookies from "js-cookie";
import axios from "axios";
import { useKeylessAccounts } from "../../lib/useKeylessAccounts";
import { Aptos, Network, AptosConfig } from '@aptos-labs/ts-sdk';
import dynamic from 'next/dynamic';
const envcollectionid = "0xb9984ac5f5fa935346f363d8da2f29aa126d6a63a29108bea3f6094707e4120d";
const graphqlaptos = "https://api.mainnet.aptoslabs.com/v1/graphql";

export default function NFTPage({params}) {
  
  const objAddr = params.objAddr;
  
  const [loading, setLoading] = useState(false);
  const [nftdata, setnftdata] = useState(null);

  const wallet = Cookies.get("tarot_wallet");
  const { activeAccount, disconnectKeylessAccount } = useKeylessAccounts();

  useEffect(() => {
    const vpnnft = async () => {
      setLoading(true);
      try {
        let walletToUse = "";

       if(wallet)
       {
          walletToUse = wallet;
       }else if(activeAccount)
       {
          walletToUse = activeAccount.accountAddress;
       }

        const graphqlbody = {
          query: `
            query MyQuery { current_token_datas_v2(where: 
              {collection_id: {_eq: \"${envcollectionid}\"}, 
              current_token_ownerships: 
              {token_data_id: {_eq: \"${objAddr}\"}}}) 
              { token_name 
                token_uri
                description
                last_transaction_version
                token_data_id
                token_properties
               } }
            `,
          operationName: "MyQuery",
        };

        const response = await axios.post(`${graphqlaptos}`, graphqlbody, {
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        });

        console.log("vpn nft", response.data.data.current_token_datas_v2);
        setnftdata(response.data.data.current_token_datas_v2);
      } catch (error) {
        console.error("Error fetching nft data:", error);
      } finally {
        setLoading(false);
      }
    };

    vpnnft();
  }, []);

  const NoSSRComponent = dynamic(() => import('../../../../components/Redirect'), {
    ssr: false
  });

  const aptosConfig = new AptosConfig({ network: Network.MAINNET });
  const aptos = new Aptos(aptosConfig);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-10"
      style={{
        backgroundImage: "url(/profilebg.png)", // Path to your background image
        backgroundSize: "cover", // Adjust as needed
        backgroundPosition: "center", // Adjust as needed
      }}
    >
      <div className="z-10 lg:max-w-7xl w-full justify-between font-mono text-sm lg:flex md:flex">
      <p
          className="text-white text-2xl backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit rounded-xl"
          style={{fontFamily: 'fantasy'}}
        >
          <Link href="/">
          Aptos Tarot
          </Link>
        </p>
        <div
          className="rounded-full px-4 py-1 lg:mt-0 md:mt-0 mt-4"
          style={{
            backgroundColor: "#E8C6AA",
            // boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <Navbar />
          <NoSSRComponent />
        </div>
      </div>

      <NftShareContainer metaDataArray={nftdata} MyReviews={false} />

      {loading && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/5 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow">
              <div className="flex justify-center gap-4">
                <img
                  className="w-50 h-40"
                  src="/loader.gif"
                  alt="Loading icon"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
