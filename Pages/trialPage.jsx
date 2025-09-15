import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Eye, Heart, Share2 } from "lucide-react";
import axios from "axios";
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, 
  WhatsappShareButton,EmailIcon,EmailShareButton, FacebookIcon, TwitterIcon,
  WhatsappIcon, LinkedinIcon } from 'react-share';




export default function FinanceDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState("");
  const [isShare, setIsShare] = useState(false);

  const Bloglist = useSelector((state) => state.blog);
  const Blog1 = Bloglist?.bloglist?.[0]?.post ? [Bloglist.bloglist[0].post] : [];
  const user = useSelector((state) => state.auth.user);

  const urlToShare = encodeURIComponent(`https://localhost:8000/api/v1/post/${"postid"}`);
  const textToShare = encodeURIComponent("Check out this amazing content!");

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(decodeURIComponent(urlToShare))
      .then(() => {
        
        setCopySuccess("Link copied!");
        setTimeout(() => setCopySuccess(""), 2000);
      })
      .catch(() => {
        setCopySuccess("Failed to copy link");
      });
  };

  
  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/allpost", {
          withCredentials: true,
        });
        setPosts(response.data.post);
      } catch (error) {
        console.log("Error fetching posts:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, []);

  if (loading) {
    return <p className="text-white text-center mt-10">Loading posts...</p>;
  }

  if (Blog1.length === 0) {
    return <p className="text-white text-center mt-10">No blog data found</p>;
  }

  const close = () => {
    !setIsShare(!isShare)
    
  }
  return (
   
   <>
   <div className="max-w-4xl mx-auto my-24 shadow-lg rounded-lg flex flex-col p-6 space-y-6">
  {posts.map((blog, idx) => (
    <div key={idx} className="flex flex-col space-y-4 bg-white p-4 rounded-2xl">

      {/* Date Section */}
      <div className="text-center text-gray-300 ">
        <div className="text-6xl font-bold">12</div>
        <div className="uppercase text-lg mt-2">January</div>
      </div>

      {/* Blog Cover Image + Actions */}
      <div className="relative">
        <img
          src={blog.coverimg}
          alt="Blog Post"
          className="w-full  min-h-96 max-h-96 object-fill rounded-lg shadow-md"
        />

        {/* Action Buttons */}
        <div className="flex justify-around items-center bg-gray-100 rounded-b-lg p-3 mt-2 shadow-inner">
          <button className="text-gray-600 flex hover:text-gray-800">
            <Heart className="w-5 h-5 cursor-pointer" />
            <span className="ml-1 text-sm">1</span>
          </button>

          <button className="text-gray-600 flex hover:text-gray-800">
            <Eye className="w-5 h-5 cursor-pointer" />
            <span className="ml-1 text-sm">1</span>
          </button>

          <button
            className="text-gray-600 hover:text-gray-800 cursor-pointer"
            onClick={()=> setIsShare(!isShare)}
          >
            <Share2 className="w-5 h-5 cursor-pointer" />
          </button>
        </div>

      </div>

      {/* Blog Content */}
      <div className="flex-1 flex flex-col justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Why you Need More Magnesium in Your Daily Diet
        </h2>

        <p className="mt-4 text-gray-700 text-sm leading-relaxed">
          Magnesium is one of the six essential macro-minerals required by the body for energy
          production and synthesis of protein and enzymes. It contributes to the development of
          bones and most importantly it is responsible for synthesis of your DNA and RNA. A new
          report in the British Journal of Cancer gives you another reason to add more magnesium
          to your diet...
        </p>
      </div>
    </div>
  ))}

</div>


  {isShare && <div className="w-1/3 h-1/3 bg-[#1f1e1e]  rounded-2xl absolute top-[46%] left-[36%] z-1 ">
         
        
        
         <div className="mt-2 flex justify-around ml-40 gap-25">
          <p className="">Share in a post</p>
          <button className="border-1 rounded-full p-2 border-red-50 cursor-pointer" onClick={close}>X</button>
         </div>
         <div className="h-1/2 flex justify-center items-center gap-3">

          <FacebookShareButton url={"XYZ"} quote={"Share the Content"}>
            <FacebookIcon size={44} round={true}/>
          </FacebookShareButton>

          <TwitterShareButton url={"XYZ"} title={"Share the Content"}>
            <TwitterIcon size={44} round={true}/>
          </TwitterShareButton>

          <LinkedinShareButton url={"XYZ"} title={"Share the Content"}>
            <LinkedinIcon size={44} round={true}/>
          </LinkedinShareButton>
          <WhatsappShareButton url={"XYZ"} title={"Share the Content"}>
            <WhatsappIcon size={44} round={true}/>
          </WhatsappShareButton>
          <EmailShareButton url={"XYZ"} title={"Share the Content"}>
            <EmailIcon size={44} round={true}/>
          </EmailShareButton>



         </div>

         <div className="clipboard flex justify-center gap-3 items-center">
            <p className="p-3 rounded-2xl bg-gray-500 text-white ">
              {decodeURIComponent(urlToShare)}
            </p>
            <button className="p-3 bg-blue-600 text-white cursor-pointer rounded-2xl" onClick={handleCopyLink}>Copy</button>
         </div>

      </div>}

    </>



  );
}
