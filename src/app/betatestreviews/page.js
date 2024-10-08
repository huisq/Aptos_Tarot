"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import NftdataContainer from "../../../components/NftDataContainer";
import Cookies from "js-cookie";
import axios from "axios";
const envcollectionid = "0x8c2c9fb156b311543f6be131e1e9999135445821b8e5190560f2e04fb558271a";
const graphqlaptos = "https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [nftdata, setnftdata] = useState(null);
  const [ownerAddresses, setOwnerAddresses] = useState(new Set());

  const wallet = Cookies.get("tarot_wallet");

  useEffect(() => {
    const vpnnft = async () => {
      setLoading(true);
      try {
        const wallet = Cookies.get("tarot_wallet");

        const graphqlbody = {
          query: `
          query MyQuery($_lt: timestamp = "2024-01-16T00:00:00.000000") {
            current_token_datas_v2(
              where: {collection_id: {_eq: "0x212ee7ca88024f75e20c79dfee04898048fb9de15cb2da27d793151a6d58db25"}, 
                current_token_ownerships: {last_transaction_timestamp: {_lt: $_lt}}}
            ) {
              token_name
              description
              current_token_ownership {
                owner_address
                last_transaction_timestamp
              }
            }
          }
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

        const extractedOwnerAddresses = response.data.data.current_token_datas_v2.map(
            (item) => item.current_token_ownership.owner_address
          );
  
          // Updating the set of owner addresses
          setOwnerAddresses(new Set(extractedOwnerAddresses));

        setnftdata(response.data.data.current_token_datas_v2);
      } catch (error) {
        console.error("Error fetching nft data:", error);
      } finally {
        setLoading(false);
      }
    };

    vpnnft();
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-24"
      style={{
        backgroundImage: "url(/tarot_design_dark.png)", // Path to your background image
        backgroundSize: "cover", // Adjust as needed
        backgroundPosition: "center", // Adjust as needed
      }}
    >
      <div className="z-10 max-w-6xl w-full items-center justify-between font-mono text-sm lg:flex">
        <Link
          href="/"
          className="text-white text-xl fixed left-0 top-0 flex w-full justify-center pb-6 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:p-4"
          style={{
            backgroundColor: "#1F2544",
            boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          Tarot Reading
        </Link>
        <div
          className="rounded-lg px-2 py-2 fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none"
          style={{
            backgroundColor: "#F1FFAB",
            boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <Navbar />
        </div>
      </div>

      <div className="text-white">
      <h1>Owner Addresses:</h1>
      <ul>
        {Array.from(ownerAddresses).map((address, index) => (
          <li key={index}>{address}</li>
        ))}
      </ul>
    </div>

      {/* <NftdataContainer metaDataArray={nftdata} MyReviews={false} /> */}

      {!wallet && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
              </div>

              <div className="p-4 space-y-4">
                <p className="text-2xl text-center font-bold" style={{color:'#FFB000'}}>
                Please connect your Aptos Wallet
                </p>
              </div>
              <div className="flex items-center p-4 rounded-b pb-20 pt-10">
                <button
                  type="button"
                  className="w-1/2 mx-auto text-black bg-white font-bold focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  <Navbar />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
