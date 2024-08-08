import { useEffect, useRef, useState } from "react";
import "./App.css";
import { LinneChart } from "./components/LinneChart";
import MemeGenerator from "./components/MemeGenerator";
import { GetGitHubInfo, GetProfileData } from "./APIs/GetProfileData";
import { Container } from "./components/Container";
import { Header } from "./components/Header";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Loader } from "./components/Loader";
import { CiLocationArrow1 } from "react-icons/ci";

function App() {
  const [myUserName, setMyUserName] = useState("");
  const [comparerUserInput, setComparerUserInput] = useState("");
  const [myData, setMyData] = useState(null);
  const [comparerData, setComparerData] = useState(null);
  const [myName, setMyName] = useState("");
  const [myTotalContribution, setMyTotalContribution] = useState(0);
  const [comparertotalContri, setComparertotalContri] = useState(0);
  const [comparerName, setComparerName] = useState("");
  const [memeIndex, setMemeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [winner, setWinner] = useState(null);
  const [loser, setLoser] = useState(null);
  const [haveData, setHaveData] = useState(false);
  const [myError, setMyError] = useState("");
  const [comparerError, setComparerError] = useState("");
  const headingContainer = useRef(null)
  const containerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous data
    setMyData(null);
    setComparerData(null);

    // Start loading
    setIsLoading(true);

    if (myUserName == comparerUserInput) {
      setMyError("You can't compare to yourself :')")
      setIsLoading(false);
      return
    }
    try {
      const [
        myProfileData,
        myGitHubInfo,
        comparerProfileData,
        comparerGitHubInfo,
      ] = await Promise.all([
        GetProfileData(myUserName),
        GetGitHubInfo(myUserName),
        GetProfileData(comparerUserInput),
        GetGitHubInfo(comparerUserInput),
      ]);

      setMyData(myProfileData);
      setMyName(myGitHubInfo?.name || myUserName);
      setComparerData(comparerProfileData);
      setComparerName(comparerGitHubInfo?.name || comparerUserInput);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        if (error.config.url.includes(myUserName)) {
          setMyError("Username not found");
        } else if (error.config.url.includes(comparerUserInput)) {
          setComparerError("Comparer username not found");
        }
      } else {
        console.error("Error fetching data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getMemeIndex = (myContribution, comparerContribution) => {
    if (myContribution === 0 && comparerContribution === 0) {
      return 0;
    }
    const maxContribution = Math.max(myContribution, comparerContribution);
    const difference = Math.abs(myContribution - comparerContribution);
    const percentageDifference = (difference / maxContribution) * 100;
    const index = Math.floor(percentageDifference / 10);
    return Math.min(index, 9);
  };

  const downloadImage = (e) => {
    if (!containerRef.current && headingContainer.current) return;

    if (isMobile) {
      headingContainer.current.style.display = 'none'
    }
    e.currentTarget.style.display = "none";
    html2canvas(containerRef.current, { backgroundColor: "#2b3137" })
      .then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "github-compare.png";
        link.click();
      })
      .catch((error) => {
        console.error("Error capturing the image:", error);
      })
      .finally(() => {

      });
    e.currentTarget.style.display = "flex"
    headingContainer.current.style.display = 'flex'
  };

  useEffect(() => {
    if (myData && comparerData) {
      const arrOfMyContri = Object.values(myData.total);
      const arrOfComparerContri = Object.values(comparerData.total);

      const myTotalContribution = arrOfMyContri.reduce(
        (total, curVal) => total + curVal,
        0
      );
      setMyTotalContribution(myTotalContribution);

      const comparerTotalContribution = arrOfComparerContri.reduce(
        (total, curVal) => total + curVal,
        0
      );
      setComparertotalContri(comparerTotalContribution);

      const memeIndex = getMemeIndex(
        myTotalContribution,
        comparerTotalContribution
      );
      setMemeIndex(memeIndex);
      const myfirstName = myName.split(" ")[0];
      const comparerfirstName = comparerName.split(" ")[0];

      if (myTotalContribution > comparerTotalContribution) {
        setWinner(myfirstName);
        setLoser(comparerfirstName);
      } else {
        setWinner(comparerfirstName);
        setLoser(myfirstName);
      }
      setHaveData(true);
    }
  }, [myData, comparerData, myName, comparerName]);

  const transition = { duration: 1, ease: "easeInOut" };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const clearDataCallBack = () => {
    setMyData(null);
    setMyName('');
    setComparerData(null);
    setComparerName('');
    setHaveData(false);
    setLoser(null);
    setWinner(null)
  }

  return (
    <motion.main
      className="body-container h-full"
      animate={{
        "--x": "68%",
        "--y": haveData ? "62%" : "100%",
        "--color1": "rgba(74,178,1,1)",
        "--color2": haveData ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)",
        "--position2": haveData ? "50%" : "0%",
      }}
      transition={transition}
    >
      <Container className="h-full pt-7 font-sans">
        <Header myData={myData} comparerData={comparerData} clearDataCallBack={clearDataCallBack} />

        <div
          ref={containerRef}
          className={`main-container  flex flex-col pb-24 md:px-8 max-md:pb-8 max-md:w-full`}
        >
          <div className="text-center font-semibold  py-12  text-yellow-50 sm:text-2xl ">
            <span className="bg-yellow-300 p-3 rounded-full px-10">Compare your Github Profile </span>
          </div>
          <AnimatePresence>
            {!haveData && (
              <motion.form
                initial={{ translateY: 10, scale: 1.1, opacity: 0 }}
                animate={{ translateY: 0, scale: 1, opacity: 1 }}
                exit={{
                  scale: 0.9,
                  opacity: 0,
                  translateY: -100,
                  height: "0%",
                }}
                transition={transition}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 items-center justify-center mt-4 max-md:flex-col max-md:w-full max-md:items-center "
              >
                <div className="my-info w-5/12 text-center relative max-md:w-full">
                  {myError && (
                    <p className="text-red-500 absolute font-bold -bottom-4 left-20  max-md:-bottom-6">
                      {myError}
                    </p>
                  )}
                  <input
                    value={myUserName}
                    onChange={(e) => setMyUserName(e.currentTarget.value)}
                    placeholder="Your Username"
                    required
                    className={`border bg-white w-[294px] ${myError ? " outline outline-red-500" : ""
                      } py-3 px-4 text-[18px] rounded-full`}
                  />
                </div>
                <div className="vs-wrapper font-bold text-[38px] text-white border-[2px] border-white aspect-square w-[64px] rounded-full grid content-center justify-center max-md:my-6">
                  {isLoading ? <Loader /> : <span>VS</span>}
                </div>
                <div className="comparer-info w-5/12 text-center relative max-md:w-full">
                  {comparerError && (
                    <p className="text-red-500 absolute font-bold -bottom-4 right-20 max-md:-bottom-6">{comparerError}</p>
                  )}
                  <input
                    value={comparerUserInput}
                    onChange={(e) =>
                      setComparerUserInput(e.currentTarget.value)
                    }
                    placeholder="Enter other persons username"
                    required
                    className={`border bg-white w-[294px] ${comparerError ? " outline outline-red-500" : ""
                      } py-3 px-4 text-[18px] rounded-full`}
                  />
                </div>
                <div className="button-wrapper w-full flex justify-center items-center  mt-10">
                  <button
                    type="submit"
                    className="bg-yellow-600 flex justify-center items-center gap-2 font-semibold text-white  rounded-xl px-5 py-2"
                  >
                    Compare

                    <CiLocationArrow1 />

                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {myData && comparerData && (
              <motion.div
                initial={{ opacity: 0, translateY: 100, scale: 0.8 }}
                exit={{ scale: 0.9, opacity: 0, translateY: -100 }}
                animate={{ translateY: 0, scale: 1, opacity: 1 }}
                transition={transition}
                className="comparison-container flex max-md:flex-col-reverse"
              >
                <div className="line-graph w-8/12 mt-8 max-md:w-full max-md:px-4">
                  <LinneChart
                    userNames={{ myname: myName, comparerName: comparerName }}
                    myData={myData?.total}
                    comparerData={comparerData?.total}
                  />
                  <div className="total-contri text-white flex gap-10 mt-10">
                    <div className="my-contri text-left flex items-center gap-3">
                      <div className="w-[54px] rounded-md bg-[#63FF60] aspect-square border border-black"></div>
                      <div className="myInfo">
                        <h1 className="my-name font-semibold text-[20px]">
                          {myName}
                        </h1>
                        <p className="text-[12px] text-[#EAEAEA] font-light">
                          Total Contribution : {myTotalContribution}
                        </p>
                      </div>
                    </div>
                    <div className="comparer-contri text-left flex items-center gap-3">
                      <div className="w-[54px] rounded-md bg-[#FFE55B] aspect-square border border-black"></div>
                      <div className="comparerInfo">
                        <h1 className="comparer-name font-semibold text-[20px]">
                          {comparerName}
                        </h1>
                        <p className="text-[12px] text-[#EAEAEA] font-light">
                          Total Contribution : {comparertotalContri}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="meme  flex flex-col justify-start mt-10 gap-6 ml-auto max-w-[400px] max-md:max-w-full max-md:ml-0 max-md:gap-0">
                  {/* <img src={memeDemo} alt="" className="max-h-[500px]" /> */}
                  <div className="canvas-wrapper max-md:flex max-md:justify-center">
                    {winner && loser && (
                      <MemeGenerator
                        winnerName={winner}
                        loserName={loser}
                        //  we dont have 10 memes yet so passing hardcoded value
                        memeIndex={memeIndex}
                      />
                    )}
                  </div>
                  {/* <div className="image-container w-[316px] h-[370px] bg-white rounded-md flex items-center justify-center">Meme</div> */}
                  <div className="btn-wrapper flex justify-center max-md:mt-4 ">
                    <button
                      onClick={(e) => downloadImage(e)}
                      type="button"
                      className="flex items-center justify-center gap-1 hover:opacity-70 bg-orange-400 text-white rounded-xl p-2"
                    >
                      Download

                      <FaArrowAltCircleDown />

                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </motion.main>
  );
}

export default App;
