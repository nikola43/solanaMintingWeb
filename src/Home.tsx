import { useEffect, useState } from "react";
import styled from "styled-components";
import Countdown from "react-countdown";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import React from "react";
import Collection from "./components/Collection";
import Nav from "./components/Nav";
import * as anchor from "@project-serum/anchor";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
} from "./candy-machine";

const ConnectButton = styled(WalletDialogButton)``;

const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div``; // add your styles here

const MintButton = styled(Button)``; // add your styles here

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const [startDate, setStartDate] = useState(new Date(props.startDate));

  const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet && candyMachine?.program) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(() => {
    (async () => {
      if (!wallet) return;

      const { candyMachine, goLiveDate, itemsRemaining } =
        await getCandyMachineState(
          wallet as anchor.Wallet,
          props.candyMachineId,
          props.connection
        );

      setIsSoldOut(itemsRemaining === 0);
      setStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  }, [wallet, props.candyMachineId, props.connection]);

  const [colorChange, setColorchange] = useState(false);
  const changeNavbarColor = () => {
    if (window.scrollY >= 80) {
      setColorchange(true);
    } else {
      setColorchange(false);
    }
  };
  window.addEventListener("scroll", changeNavbarColor);

  return (
    <main>
      <MintContainer>
        <>
          <div className={colorChange ? "header colorChange" : "header"}>
            <div className="container">
              <div className="header-content-wrapper">
                <a href="/" className="site-logo" title="back to index">
                  {/* <img
              loading="lazy"
              width="200"
              src="http://babypunks.com/img/logo-primary.png"
              alt="babypunks"
            /> */}
                </a>

                <nav>
                  <ul
                    className="primary-menu-menu primary-menu-indented scrollable"
                    style={{ maxHeight: "460px", display: "inline-block" }}
                  >
                    <li className="menu-item-has-children">
                      <a title="NFT" href="#">
                        NFT<span className="indicator"></span>
                      </a>
                      <ul
                        className="sub-menu sub-menu-right"
                        style={{ display: "none" }}
                      >
                        <li className="menu-item-has-children">
                          <a title="MINT" href="#MINT" data-scroll="true">
                            MINT
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a title="story" href="#story" data-scroll="true">
                            Story
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            title="roadmap"
                            href="#roadmap"
                            data-scroll="true"
                          >
                            Roadmap
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a title="team" href="#team" data-scroll="true">
                            Team
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <a title="buy" href="/">
                        BUY<span className="indicator"></span>
                      </a>
                      <ul
                        className="sub-menu sub-menu-right"
                        style={{ display: "none" }}
                      >
                        <li className="menu-item-has-children">
                          <a title="mint" href="/">
                            BUY NFT
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a title="" href="/">
                            BabyPunks Coin
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <a title="babypunkcoin" href="/">
                        BabyPunks Coin<span className="indicator"></span>
                      </a>
                      <ul
                        className="sub-menu sub-menu-right"
                        style={{ display: "none" }}
                      >
                        <li className="menu-item-has-children">
                          <a title="bpmint" href="/">
                            White paper
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            title="Roadmap"
                            href="#roadmap"
                            data-scroll="true"
                          >
                            Roadmap
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a title="Audit" href="/">
                            Audit
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a title="BPCMarket" href="/">
                            Market
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <a title="Market" href="/">
                        Market<span className="indicator"></span>
                      </a>
                      <ul
                        className="sub-menu sub-menu-right"
                        style={{ display: "none" }}
                      >
                        <li className="menu-item-has-children">
                          <a
                            title="coinmarket"
                            target="_blank"
                            href="https://coinmarketcap.com/currencies/babypunks/"
                            rel="noreferrer"
                          >
                            Coinmarketcap
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            title="coingecko"
                            target="_blank"
                            href="https://www.coingecko.com/en/coins/babypunks"
                            rel="noreferrer"
                          >
                            Coingecko
                          </a>
                        </li>
                      </ul>
                    </li>

                    <li className="menu-item-has-children">
                      <a href="/">
                        Socialmedia<span className="indicator"></span>
                      </a>
                      <ul
                        className="sub-menu sub-menu-right"
                        style={{ display: "none" }}
                      >
                        <li className="menu-item-has-children">
                          <a
                            aria-label="Twitter"
                            className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW"
                            href="https://twitter.com/BabyPunksCoin"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Twitter
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            aria-label="Telegram"
                            className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW"
                            href="https://t.me/babypunkofficial"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Telegram
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            rel="noopener noreferrer"
                            href="https://www.instagram.com/babypunkscoin"
                          >
                            Instagram
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            rel="noopener noreferrer"
                            href="https://www.facebook.com/BabyPunksCoin"
                          >
                            Facebook
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            rel="noopener noreferrer"
                            href="https://www.reddit.com/r/babypunksofficial"
                          >
                            Reddit
                          </a>
                        </li>
                        <li className="menu-item-has-children">
                          <a
                            rel="noopener noreferrer"
                            href="http://discord.gg/babypunks"
                          >
                            Discord
                          </a>
                        </li>
                      </ul>
                    </li>

                    <li>
                      {!wallet && (
                        <ConnectButton>
                        </ConnectButton>
                      )}

                      {wallet && (
                        <p>Connected: {shortenAddress(wallet.publicKey.toBase58() || "")}</p>
                      )}
                    </li>



                    {/* <button
                        // onClick={() => setShowModal(true)}
                        className="mint_btn"
                      >
                        <img
                          loading="lazy"
                          width="200"
                          height="80"
                          src="http://babypunks.com/img/pixel_button.png"
                          alt="babypunks"
                        />
                      </button> */}
                  </ul>
                </nav>
              </div>

              {/* <Modal onClose={() => setShowModal(false)} show={showModal} /> */}
            </div>
          </div>
          <div className="main-content-wrapper backgroundGradient">
            {/* <Nav /> */}

            <section className="main-section medium-padding120 responsive-align-center">
              <div className="container">
                <div className="row">
                  <div
                    className="col-lg-6 col-md-6 col-lg-offset-0 col-sm-6 col-xs-6 ihdgua-0 bDorMw"
                    style={{ textAlign: "center" }}
                  >
                    <img
                      loading="lazy"
                      src="http://babypunks.com/img/logo-primary.png"
                      style={{ borderRadius: "16px" }}
                      alt="header"
                    />
                  </div>
                  <div className="row" id="MINT">
                    <div className="col-lg-7 col-md-12 col-lg-offset-0 col-sm-12 col-xs-12">
                      <div style={{ marginBottom: "130px", textAlign: "center" }}>
                        <h3>10,000 unique BabyPunks live on Solana</h3>

                        <p>
                          BabyPunks is a limited NFT collection on the Solana
                          blockchain. Supply is capped at 10,000. Your BabyPunks allow
                          you to earn 5% royalties paid in SOL tokens from every buy &
                          sell for life.
                        </p>

                        <p>
                          All BabyPunks are programmatically generated to include
                          numerous traits and rarity. Adopting a BabyPunk also gives
                          you access to features within our BabyPunk Arcade which will
                          feature a series of old school classic games similar to
                          Tetris, Flappy Bird, and more.
                        </p>

                        <p>
                          All BabyPunks will be revealed shortly after being minted
                          along with activating special community features based on
                          the roadmap.
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-5 col-md-12 col-lg-offset-0 col-sm-12 col-xs-12">
                      <div className="widget w-distribution-ends">
                        <img
                          loading="lazy"
                          id="random"
                          src="http://babypunks.com/img/random/2.png"
                          alt="random nft"
                        />
                        <MintButton
                          disabled={isSoldOut || isMinting || !isActive}
                          onClick={onMint}
                          variant="contained"
                        >
                          {isSoldOut ? (
                            "SOLD OUT"
                          ) : isActive ? (
                            isMinting ? (
                              <CircularProgress />
                            ) : (
                              "MINT"
                            )
                          ) : (
                            <Countdown
                              date={startDate}
                              onMount={({ completed }) => completed && setIsActive(true)}
                              onComplete={() => setIsActive(true)}
                              renderer={renderCounter}
                            />
                          )}
                        </MintButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Collection />
          </div>
        </>
        )
      </MintContainer>

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </main>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
  return (
    <CounterText>
      {hours} hours, {minutes} minutes, {seconds} seconds
    </CounterText>
  );
};

export default Home;
