"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Cookies from "js-cookie";
import axios from "axios";

export default function Home() {
  const [drawnCard, setDrawnCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ques, setques] = useState(false);
  const [description, setDescription] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [cardimage, setcardimage] = useState("");
  const [position, setposition] = useState("");
  const [mintdone, setmintdone] = useState(false);

  const wallet = Cookies.get("tarot_wallet");

  const handleDrawCardAndFetchreading = async () => {
    const wallet = Cookies.get("tarot_wallet");

    setLoading(true);

    const drawTransaction = {
      arguments: [],
      function:
        "0x973d0f394a028c4fc74e069851114509e78aba9e91f52d000df2d7e40ec5205b::tarot::draws_card_v4",
      type: "entry_function_payload",
      type_arguments: [],
    };

    try {
      const drawResponse = await window.aptos.signAndSubmitTransaction(
        drawTransaction
      );
      console.log("Drawn Card Transaction:", drawResponse);

      const card = drawResponse.events[0].data.card;
      const position = drawResponse.events[0].data.position;

      setcardimage(drawResponse.events[0].data.card_uri);
      setDrawnCard(drawResponse.events[0].data.card);
      setposition(drawResponse.events[0].data.position);

      const requestBody = {
        inputFromClient: description,
        outputCard: card,
        outputPosition: position,
      };

      const readingResponse = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!readingResponse.ok) {
        throw new Error("Failed to fetch rap lyrics");
      }

      const readingData = await readingResponse.json();
      setLyrics(readingData.lyrics);

      console.log("Data to send in mint:", card, position);

      // const mintTransaction = {
      //   arguments: [wallet, description, readingData.lyrics, card, position],
      //   function:
      //     '0x973d0f394a028c4fc74e069851114509e78aba9e91f52d000df2d7e40ec5205b::tarot::mint_card_v4',
      //   type: 'entry_function_payload',
      //   type_arguments: [],
      // };

      // const mintResponse = await window.aptos.signAndSubmitTransaction(mintTransaction);
      // console.log('Mint Card Transaction:', mintResponse);
    } catch (error) {
      console.error("Error handling draw card and fetching rap lyrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const mintreading = async () => {
    const wallet = Cookies.get("tarot_wallet");
    setLoading(true);

    try {
      const mintTransaction = {
        arguments: [description, lyrics, drawnCard, position],
        function:
          "0x973d0f394a028c4fc74e069851114509e78aba9e91f52d000df2d7e40ec5205b::tarot::mint_card_v4",
        type: "entry_function_payload",
        type_arguments: [],
      };

      const mintResponse = await window.aptos.signAndSubmitTransaction(
        mintTransaction
      );
      console.log("Mint Card Transaction:", mintResponse);
      setmintdone(true);
    } catch (error) {
      console.error("Error handling draw card and fetching rap lyrics:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <p
          className="text-white text-xl fixed left-0 top-0 flex w-full justify-center pb-6 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:p-4"
          style={{
            backgroundColor: "#1F2544",
            boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          Tarot Reading
        </p>
        <div
          className="rounded-lg px-6 py-2 fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none"
          style={{
            backgroundColor: "#F1FFAB",
            boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <Navbar />
        </div>
      </div>

      <div className="flex gap-10">
        <div>
          {!ques && (
            <button
              onClick={() => {
                setques(true);
              }}
              className="bg-white rounded-lg py-2 px-8 text-black mt-40"
            >
              Ask question
            </button>
          )}

          {ques && wallet && (
            <div
              className="px-10 py-10 bgcolor rounded-2xl mt-10 max-w-xl"
              style={{
                border: "1px solid #0162FF",
                boxShadow: "inset -10px -10px 60px 0 rgba(255, 255, 255, 0.4)",
              }}
            >
              {!lyrics && (
                <>
                  <input
                    type="text"
                    placeholder="Write your question here"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="p-2 rounded-lg w-full focus:outline-none"
                  />
                  <button
                    onClick={handleDrawCardAndFetchreading}
                    className="mt-20 bg-black rounded-lg py-2 px-8 text-white"
                  >
                    Get my reading
                  </button>
                </>
              )}
              <div>
                {lyrics && (
                  <div>
                    <div className="flex gap-4 pb-8">
                      <button
                        onClick={() => {
                          setques(true);
                          setDrawnCard(null);
                          setLyrics("");
                        }}
                        className="bg-black rounded-lg py-2 px-8 text-yellow-200"
                      >
                        Start Again
                      </button>

                      <button
                        onClick={mintreading}
                        className="bg-yellow-100 rounded-lg py-2 px-6 text-black font-semibold"
                      >
                        Mint reading
                      </button>
                    </div>
                    <h2 className="font-bold mb-2 text-white">
                      Your Tarot Reading:
                    </h2>
                    <p className="text-white">{lyrics}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {drawnCard && lyrics ? (
          <div>
            <h2 className="mt-10 text-white">{drawnCard}</h2>
            {position === "upright" ? (
              <img
                src={`${"https://nftstorage.link/ipfs"}/${
                  cardimage.split("ipfs://")[1]
                }`}
                width="200"
                height="200"
              />
            ) : (
              <img
                src={`${"https://nftstorage.link/ipfs"}/${
                  cardimage.split("ipfs://")[1]
                }`}
                width="200"
                height="200"
                style={{ transform: "rotate(180deg)" }}
              />
            )}
          </div>
        ) : (
          <div className="rounded-lg mt-10">
            <Image src="/tarot_card.jpg" width="200" height="200" />
          </div>
        )}
      </div>

      {ques && !wallet && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
                <button
                  onClick={() => setques(false)}
                  type="button"
                  className="text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* <Image src={emoji} alt="info" className="mx-auto"/> */}

              <div className="p-4 space-y-4">
                <p className="text-2xl text-center font-bold text-red-500">
                  Please connect your wallet!!
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

      {/* <div className="mb-32 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left flex justify-center">

        <div
          className="group rounded-lg border border-transparent bg-white px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-balance`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </div>
      </div> */}

      {mintdone && (
        <div
          style={{ backgroundColor: "#222944E5" }}
          className="flex overflow-y-auto overflow-x-hidden fixed inset-0 z-50 justify-center items-center w-full max-h-full"
          id="popupmodal"
        >
          <div className="relative p-4 lg:w-1/3 w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-black text-white">
              <div className="flex items-center justify-end p-4 md:p-5 rounded-t dark:border-gray-600">
                <button
                  onClick={() => setmintdone(false)}
                  type="button"
                  className="text-white bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* <Image src={emoji} alt="info" className="mx-auto"/> */}

              <div className="p-4 space-y-4">
                <p className="text-3xl text-center font-bold text-green-500">
                  Successfully Minted!!
                </p>
                <p className="text-sm text-center pt-4">
                  Go to your profile to view your minted NFTs
                </p>
              </div>
              <div className="flex items-center p-4 rounded-b pb-20">
                <button
                  // style={backgroundbutton}
                  // onClick={gotoprojects}
                  type="button"
                  className="w-1/2 mx-auto text-black bg-white font-bold focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  My Profile
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

                {/* <span className="text-white mt-2">Loading...</span> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
