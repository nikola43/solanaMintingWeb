import {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import {Button, CircularProgress, Snackbar} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import React from "react";
import * as anchor from "@project-serum/anchor";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";

import {useAnchorWallet} from "@solana/wallet-adapter-react";
import {
    WalletDialogButton,
    WalletMultiButton,
    WalletDisconnectButton,
} from "@solana/wallet-adapter-material-ui";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import {
    CandyMachine,
    awaitTransactionSignatureConfirmation,
    getCandyMachineState,
    mintOneToken,
} from "./candy-machine";
import CountDownTimer from "./components/CountDownTimer";

import logo from "./assets/img/logo-primary.png";
import baby3 from "./assets/img/baby_3.png";
import baby5 from "./assets/img/baby_5.png";
import baby7 from "./assets/img/baby_7.png";
import baby8 from "./assets/img/baby_8.png";
import baby9 from "./assets/img/baby_9.png";
import baby13 from "./assets/img/baby_13.png";
import baby14 from "./assets/img/random/21.png";
import baby15 from "./assets/img/random/14.png";
import random1 from "./assets/img/random/1.png";
import pdf1 from "./pdf/WP3.pdf";
import pdf2 from "./pdf/Audit.pdf";

// import random2 from "./assets/img/random/2.png";
// import random3 from "./assets/img/random/3.png";
// import random4 from "./assets/img/random/4.png";
// import random5 from "./assets/img/random/5.png";
// import random6 from "./assets/img/random/6.png";
// import random7 from "./assets/img/random/7.png";
// import random8 from "./assets/img/random/8.png";
// import random9 from "./assets/img/random/9.png";
// import random10 from "./assets/img/random/10.png";
// import random11 from "./assets/img/random/11.png";
// import random12 from "./assets/img/random/12.png";
// import random13 from "./assets/img/random/13.png";
// import random14 from "./assets/img/random/14.png";

import babyIlustration from "./assets/img/baby_illustration.png";
import banner2 from "./assets/img/banner2.png";
import pixelBtn from "./assets/img/pixel_button.png";

// const ConnectButton = styled(WalletDialogButton)``;

// const CounterText = styled.span``; // add your styles here

// const MintButton = styled(Button)``; // add your styles here

const MintContainer = styled.div``; // add your styles here

export interface HomeProps {
    candyMachineId: anchor.web3.PublicKey;
    config: anchor.web3.PublicKey;
    connection: anchor.web3.Connection;
    startDate: number;
    treasury: anchor.web3.PublicKey;
    txTimeout: number;
}

let subtitle: any;

// const ComponentDidMount = () => {};

const Home = (props: HomeProps) => {
    const [balance, setBalance] = useState<number>();
    // const [isActive, setIsActive] = useState(false); // true when countdown completes
    const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
    const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
    const [mintNumber, setMintNumber] = useState([] as any);
    const defaultMintingNumber = 1;
    const [alertState, setAlertState] = useState<AlertState>({
        open: false,
        message: "",
        severity: undefined,
    });

    // let selectedValue = " ";

    let wallet = useAnchorWallet();

    // const handleConnected = () => {};

    const [startDate, setStartDate] = useState(new Date(props.startDate));

    const [candyMachine, setCandyMachine] = useState<CandyMachine>();

    const connectButtonClick = async () => {
        const b = document.getElementById("connectButton");
        b?.click();
    };

    const [modalIsOpen, setIsOpen] = React.useState(false);

    function openModal() {
        setIsOpen(true);
    }

    function afterOpenModal() {
        subtitle.style.color = "#f00";
    }

    function closeModal() {
        setIsOpen(false);
    }

    const onMints = async (num: Number) => {
        num = 20;
        for (let index = 0; index < num; index++) {
            await onMint();
        }
    }

    const onMint = async () => {
        try {
            setIsMinting(true);
            if (wallet && candyMachine?.program) {
                let v = document.getElementById("mintamount");

                if (v) {
                    const l = document.getElementById("mintamount")?.innerText;
                    console.log(l);
                }

                console.log("mintNumber");
                console.log(mintNumber);

                const mintTxId = await mintOneToken(
                    candyMachine,
                    props.config,
                    wallet.publicKey,
                    props.treasury,
                    mintNumber
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
                        message: "Mint failed!! Please try again!",
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

    const generateRandomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min) + min);
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

            const {candyMachine, goLiveDate, itemsRemaining} =
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

    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    /*
    var date = new Date();
    var now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
        date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

    let dateUTC = new Date(now_utc);
    */



    const distance =
        new Date(Date.UTC(2021,9,8,21)).getTime() - new Date(Date.now()).getTime();
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const hoursMinSecs = {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: hours,
        minutes: Math.floor((distance / 1000 / 60) % 60),
        seconds: Math.floor((distance / 1000) % 60),
    };

    // let random = random1;
    // setInterval(() => {
    //   random = 'random' + Math.floor(Math.random()*31);
    // }, 800);

    return (
        <main>
            <div>
                <Dialog className="text-center" open={open} onClose={handleClose}>
                    <DialogTitle>Mint Ramdom NFT</DialogTitle>
                    <DialogContent>
                        <img
                            id="ramdomBaby"
                            loading="lazy"
                            src="https://s3.eu-central-1.wasabisys.com/steleros/gif_2.gif"
                            style={{borderRadius: "16px", width: "350px", height: "350px"}}
                            alt="header"
                        />

                        <TextField
                            autoFocus
                            margin="dense"
                            id="mintamount"
                            label="Mint amount"
                            type="number"
                            InputProps={{
                                inputProps: {
                                    max: 20,
                                    min: 1,
                                },
                            }}
                            fullWidth
                            variant="standard"
                            value={mintNumber}

                            onChange={(e) => setMintNumber(e.target.value)}
                        />

                        <div>
                            {isMinting ? (
                                <CircularProgress/>
                            ) : (
                                <img
                                    onClick={wallet ? onMint : connectButtonClick}
                                    className="randomImage"
                                    loading="lazy"
                                    id="random"
                                    style={{cursor: "pointer", width: "179px", height: "77px"}}
                                    src={pixelBtn}
                                    alt="random nft"
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <MintContainer id="mintContainer">
                <>
                    <div className={colorChange ? "header colorChange" : "header"}>
                        <div className="container">
                            <div className="header-content-wrapper">
                                <nav className="navbar navbar-expand-lg navbar-dark">
                                    <div className="container-fluid">
                                        <a
                                            href="/"
                                            className="site-logo navbar-brand"
                                            title="back to index"
                                        >
                                            <img
                                                loading="lazy"
                                                width="200"
                                                src={logo}
                                                alt="babypunks"
                                            />
                                        </a>
                                        <button
                                            className="navbar-toggler"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#navbarNavDropdown"
                                            aria-controls="navbarNavDropdown"
                                            aria-expanded="false"
                                            aria-label="Toggle navigation"
                                        >
                                            <span className="navbar-toggler-icon"></span>
                                        </button>
                                        <div
                                            className="collapse navbar-collapse"
                                            id="navbarNavDropdown"
                                        >
                                            <ul className="navbar-nav">
                                                <li className="nav-item dropdown">
                                                    <a
                                                        className="nav-link dropdown-toggle"
                                                        href="#"
                                                        id="navbarDropdownMenuLink"
                                                        role="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        NFT
                                                    </a>
                                                    <ul
                                                        className="dropdown-menu"
                                                        aria-labelledby="navbarDropdownMenuLink"
                                                    >
                                                        <li>
                                                            <a
                                                                title="Mint"
                                                                className="dropdown-item"
                                                                href="#MINT"
                                                            >
                                                                Mint
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                title="story"
                                                                className="dropdown-item"
                                                                href="#story"
                                                            >
                                                                Story
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                title="roadmap"
                                                                className="dropdown-item"
                                                                href="#roadmap"
                                                            >
                                                                Roadmap
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                title="team"
                                                                className="dropdown-item"
                                                                href="#team"
                                                            >
                                                                Team
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </li>
                                                <li className="nav-item dropdown">
                                                    <a
                                                        className="nav-link dropdown-toggle"
                                                        href="#"
                                                        id="navbarDropdownMenuLink"
                                                        role="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        Buy
                                                    </a>
                                                   <ul
                                                        className="dropdown-menu"
                                                        aria-labelledby="navbarDropdownMenuLink"
                                                    >
                                                        <li>
                                                            <a
                                                                className="dropdown-item"
                                                                href="#"
                                                                role="button"
                                                                aria-expanded="false"
                                                            >
                                                                Coming soon to Solana
                                                            </a>
                                                        </li>

                                                    </ul>

                                                </li>
                                                <li className="nav-item dropdown">
                                                    <a
                                                        className="nav-link dropdown-toggle"
                                                        href="#"
                                                        id="navbarDropdownMenuLink"
                                                        role="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        BabyPunks Coin
                                                    </a>
                                                    <ul
                                                        className="dropdown-menu"
                                                        aria-labelledby="navbarDropdownMenuLink"
                                                    >
                                                        <li>
                                                            <a
                                                                title="White paper"
                                                                className="dropdown-item"
                                                                href={pdf1}
                                                                download
                                                            >
                                                                White paper
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                title="Audit"
                                                                className="dropdown-item"
                                                                href={pdf2}
                                                                download
                                                            >
                                                                Audit
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </li>
                                                <li className="nav-item dropdown">
                                                    <a
                                                        className="nav-link dropdown-toggle"
                                                        href="#"
                                                        id="navbarDropdownMenuLink"
                                                        role="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        Social Media
                                                    </a>
                                                    <ul
                                                        className="dropdown-menu"
                                                        aria-labelledby="navbarDropdownMenuLink"
                                                    >
                                                        <li>
                                                            <a
                                                                aria-label="Twitter"
                                                                className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW dropdown-item"
                                                                href="https://twitter.com/BabyPunksCoin"
                                                                rel="noopener noreferrer"
                                                                target="_blank"
                                                            >
                                                                Twitter
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                aria-label="Telegram"
                                                                className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW dropdown-item"
                                                                href="https://t.me/babypunksofficial"
                                                                rel="noopener noreferrer"
                                                                target="_blank"
                                                            >
                                                                Telegram
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                aria-label="Instagram"
                                                                className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW dropdown-item"
                                                                href="https://www.instagram.com/babypunkscoin"
                                                                rel="noopener noreferrer"
                                                                target="_blank"
                                                            >
                                                                Instagram
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                aria-label="Facebook"
                                                                className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW dropdown-item"
                                                                href="https://www.facebook.com/BabyPunksCoin"
                                                                rel="noopener noreferrer"
                                                                target="_blank"
                                                            >
                                                                Facebook
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                aria-label="Reddit"
                                                                className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW dropdown-item"
                                                                href="https://www.reddit.com/r/babypunksofficial"
                                                                rel="noopener noreferrer"
                                                                target="_blank"
                                                            >
                                                                Reddit
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                aria-label="Discord"
                                                                className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW dropdown-item"
                                                                href="http://discord.gg/babypunks"
                                                                rel="noopener noreferrer"
                                                                target="_blank"
                                                            >
                                                                Discord
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a
                                                                aria-label="Medium"
                                                                className="sc-1i4jqyq-0 dgglXh sc-1gbjr5k-6 jemGW dropdown-item"
                                                                href="https://medium.com/@BabyPunks"
                                                                rel="noopener noreferrer"
                                                                target="_blank"
                                                            >
                                                                Medium
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </li>
                                                <li className="nav-item dropdown">
                                                    <a
                                                        className="nav-link dropdown-toggle"
                                                        href="#"
                                                        id="navbarDropdownMenuLink"
                                                        role="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        Contact
                                                    </a>
                                                    <ul
                                                        className="dropdown-menu"
                                                        aria-labelledby="navbarDropdownMenuLink">
                                                        <li>
                                                            <a href="mailto:info@babypunks.com"
                                                                aria-label="Contact"
                                                                className="dropdown-item"
                                                            >
                                                                info@babypunks.com
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </li>
                                                <li className="nav-item">
                                                    {!wallet && <WalletMultiButton id="connectButton"></WalletMultiButton>}
                                                    {wallet && <WalletDisconnectButton/>}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </nav>
                            </div>

                            {/* <Modal onClose={() => setShowModal(false)} show={showModal} /> */}
                        </div>
                    </div>
                    <div className="main-content-wrapper backgroundGradient">
                        <section className="main-section medium-padding120 responsive-align-center">
                            <div className="container">
                                <div className="row" style={{justifyContent: "center"}}>
                                    <div
                                        className="col-lg-6 col-md-6 col-lg-offset-0 col-sm-6 col-xs-6 ihdgua-0 bDorMw"
                                        style={{textAlign: "center"}}
                                    >
                                    </div>
                                    <div className="row" id="MINT">
                                        <div className="col-lg-7 col-md-12 col-lg-offset-0 col-sm-12 col-xs-12">
                                            <div
                                                style={{marginBottom: "130px", textAlign: "center"}}
                                            >
                                                <h3 style={{marginTop: "1rem", textAlign: "center"}}>
                                                    10,000 unique BabyPunks live on Solana
                                                </h3>

                                                <p>
                                                    BabyPunks is a limited NFT collection on the Solana
                                                    blockchain.Supply is capped at 10,000.Your BabyPunks
                                                    allow you to earn 5% royalties paid in SOL tokens from
                                                    every buy & sell for life.
                                                </p>

                                                <p>
                                                    All BabyPunks are programmatically generated to
                                                    include numerous traits and rarity.Adopting a BabyPunk
                                                    also gives you access to features within our BabyPunk
                                                    Arcade which will feature a series of old school
                                                    classic games similar to Tetris, Flappy Bird, and
                                                    more.
                                                </p>

                                                <p>
                                                    All BabyPunks will be revealed shortly after being
                                                    minted along with activating special community
                                                    features based on the roadmap.
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            className="col-lg-5 col-md-12 col-lg-offset-0 col-sm-12 col-xs-12 text-center">
                                            <div className="widget w-distribution-ends">
                                                <img
                                                    className="randomImage"
                                                    loading="lazy"
                                                    id="random"
                                                    src="https://s3.eu-central-1.wasabisys.com/steleros/gif_1.gif"
                                                    style={{borderRadius: "16px", width: "400px", height: "400px"}}
                                                    alt="random nft"
                                                />
                                                <img
                                                    onClick={handleClickOpen}
                                                    className="randomImage mt-1"
                                                    loading="lazy"
                                                    id="random"
                                                    style={{cursor: "pointer"}}
                                                    src={pixelBtn}
                                                    alt="random nft"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-5 col-md-12 col-lg-offset-0 col-sm-12 col-xs-12">
                                        <div className="widget w-distribution-ends">
                                            <img
                                                loading="lazy"
                                                id="random2"
                                                src={babyIlustration}
                                                alt="babypunk ilustration"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-7 col-md-12 col-lg-offset-0 col-sm-12 col-xs-12">
                                        <div style={{marginBottom: "130px", textAlign: "center"}}>
                                            <h4>
                                                These pixel babies earn you passive income for life.
                                                Profits go to the community.
                                            </h4>

                                            <p style={{fontSize: "1.6rem", marginTop: "4rem"}}>
                                                Mint Date: October 8th, 2021
                                            </p>

                                            <p style={{fontSize: "1.7rem"}}>Price: 2 Solana</p>
                                            {hours > 1 && (
                                                <CountDownTimer hoursMinSecs={hoursMinSecs}/>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div id="" className="container text-center">
                                <div className="col-md-12 col-sm-12 col-xs-12 mb-2">
                                    <h1>The Story</h1>
                                </div>
                                <div className="row text-center" id="story" style={{justifyContent: "center"}}>
                                    <div className="row mb-5">
                                        <img loading="lazy" src={banner2} alt="storyImage"/>
                                    </div>
                                    <div className="col-md-12 col-sm-12 col-xs-12 transparent">
                                        <p>
                                            BabyPunks are the spawn of what happens when you have a
                                            bunch of badass CryptoPunks mixed with pop culture,
                                            internet memes and peyote.This lot are looking for a new
                                            home and are up for adoption.They were originally going to
                                            find new homes on Ethereum, but it was too old, congested
                                            and full of other babies who looked neglected.The
                                            BabyPunks banded together and set a course for uncharted
                                            territory - Solana.It’s every pixel's dream and now they
                                            have their chance at the big leagues.
                                        </p>
                                        <p>
                                            All they need is the right person to take them under their
                                            wing and teach them the ropes. These punks may be small
                                            but they have big dreams and their properties uniquely
                                            reflect who they are and promise to reward their owners
                                            handsomely.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <br/>
                        <br/>
                        <br/>
                        <section id="roadmap">
                            <div className="container text-center">
                                <div className="col-md-12 col-sm-12 col-xs-12 mb-4">
                                    <h1>Roadmap</h1>
                                </div>
                            </div>
                            <div className="container">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-12 col-lg-6">
                                            <div className="road-content">
                                                <div className="red-process20"></div>
                                                <div className="road-detail">
                                                    <h4>20% Sold</h4>
                                                    <h6 className="red">NFT Giveaway</h6>
                                                    <p>
                                                        A random airdrop of 20 NFTs to early community
                                                        members in our discord.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6">
                                            <div className="road-content">
                                                <div className="red-process40"></div>
                                                <div className="road-detail">
                                                    <h4>40% Sold</h4>
                                                    <h6 className="red">BabyPunks 10x Baby Bonus</h6>
                                                    <p>
                                                        On the 4000th sale, there will be a payout 10x the
                                                        mint price in SOL to 4 community members in our
                                                        discord.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6">
                                            <div className="road-content">
                                                <div className="red-process50"></div>
                                                <div className="road-detail">
                                                    <h4>50% Sold</h4>
                                                    <h6 className="red">BabyPunks Merch</h6>
                                                    <p>
                                                        BabyPunks Merch store will be rolled out where NFT
                                                        holders will get first dibs and exclusive access to
                                                        limited edition t-shirts, hats, and hoodies.Non-NFT
                                                        holders will be given access at a later date.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6">
                                            <div className="road-content">
                                                <div className="red-process60"></div>
                                                <div className="road-detail">
                                                    <h4>60% Sold</h4>
                                                    <h6 className="red">BabyPunks Sweeper</h6>
                                                    <p>
                                                        A liquidity wallet will be created that will be used
                                                        to buy the floor of BabyPunk NFTs.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6">
                                            <div className="road-content">
                                                <div className="red-process70"></div>
                                                <div className="road-detail">
                                                    <h4>70% Sold</h4>
                                                    <h6 className="red">BabyPunks Gives Back</h6>
                                                    <p>
                                                        The community will direct a $10,000 gift to a
                                                        charity of the community's choosing. A grant of
                                                        $15,000 will be set up to fund a community project
                                                        that contributes to the growth of BabyPunks.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6">
                                            <div className="road-content">
                                                <div className="red-process80"></div>
                                                <div className="road-detail">
                                                    <h4>80% Sold</h4>
                                                    <h6 className="red">TeenPunks</h6>
                                                    <p>
                                                        We will create a limited collection of stylized
                                                        TeenPunks and airdrop them to all holders.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-lg-6">
                                            <div className="road-content">
                                                <div className="red-process100"></div>
                                                <div className="road-detail">
                                                    <h4>100% Sold</h4>
                                                    <h6 className="red">The PUNK-A-TRON Arcade</h6>
                                                    <p>
                                                        We will build an even bigger arcade than we planned
                                                        for previously that will host approximately 10
                                                        titles by the end of this year.The games will
                                                        feature retro old school classics.All NFT holders
                                                        will be able to stake their NFTs to earn BabyPunk
                                                        Tokens from transaction fees paid by players to play
                                                        the games to compete head to head for prizes such
                                                        popular NFTs, and SOL tokens.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <br/>
                        <br/>
                        <br/>
                        <section>
                            <div id="team" className="container text-center">
                                <div className="row">
                                    <div className="col-lg-12 col-sm-12 col-xs-12 mb-5">
                                        <h1>The Team</h1>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-3 col-sm-6 col-xs-12">
                                        <img src={baby3} alt="dev"/>
                                        <p>BabyPunkGuy</p>
                                        <p>Dev</p>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-xs-12">
                                        <img src={baby15} alt="smmark"/>
                                        <p>Nefu</p>
                                        <p>Social Media Marketing</p>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-xs-12">
                                        <img src={baby7} alt="man"/>
                                        <p>SK</p>
                                        <p>Project Management</p>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-xs-12">
                                        <img src={baby8} alt="marks"/>
                                        <p>CaptainM00n</p>
                                        <p>Marketing Strategy</p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-3 col-sm-6 col-xs-12">
                                        <img src={baby9} alt="marks"/>
                                        <p>Mr.Óseo</p>
                                        <p>NFT Designer</p>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-xs-12">
                                        <img src={baby13} alt="marks"/>
                                        <p>NKT43</p>
                                        <p>Dev</p>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-xs-12">
                                        <img src={baby14} alt="marks"/>
                                        <p>DRG809</p>
                                        <p>Dev</p>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-xs-12">
                                        <img src={baby5} alt="marks"/>
                                        <p>Lucky Punk</p>
                                        <p>Dev</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <section className="backgroundGradient">
                        <div id="team" className="container text-center backgroundGradient">
                            <div className="row">
                                <div className="col-lg-12 col-sm-12 col-xs-12 mb-5">
                                    <h3>BabyPunks</h3>
                                    <h5>© All right reserved 2021.</h5>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            </MintContainer>

            <Snackbar
                open={alertState.open}
                autoHideDuration={6000}
                onClose={() => setAlertState({...alertState, open: false})}
            >
                <Alert
                    onClose={() => setAlertState({...alertState, open: false})}
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

export default Home;
