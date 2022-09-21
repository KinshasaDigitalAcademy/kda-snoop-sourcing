import BaseLayoutManagement from "../../../components/layout/BaseLayoutManagement";
import { ClockIcon } from "@heroicons/react/24/solid";
import withAuthentication from "../../../components/layout/WithAuthentication";
import Loading from "../../../components/Loading";
import MessagePage from "../../../components/MessagePage";
import { useNoCodeFormPublic } from "../../../lib/noCodeForm";
import { useRouter } from "next/router";
import Image from "next/image";
import getConfig from "next/config";
import usePages from "../../../hooks/usePages";
import LimitedWidth from "../../../components/layout/LimitedWidth";

const { publicRuntimeConfig } = getConfig();
const { publicPrivacyUrl, publicImprintUrl } = publicRuntimeConfig;

function NoCodeFormPublic() {
  const router = useRouter();
  const formId = router.query.id?.toString();
  const completed=true;
  const { noCodeForm, isLoadingNoCodeForm, isErrorNoCodeForm } =
    useNoCodeFormPublic(formId);
      //
  
  if (isLoadingNoCodeForm) {
    return <Loading />;
  }

  const pages = usePages({blocks:noCodeForm.blocks, formId:formId})
  console.log(noCodeForm.blocks[0].data.text);


  if (isErrorNoCodeForm || !noCodeForm?.published) {
    return (
      <MessagePage text="Form not found. Are you sure this is the right URL?" />
    );
  }

  return (
    <BaseLayoutManagement       
    title={"Forms - snoopForms"}
    breadcrumbs={[{ name: `My Sourcings / Form ${formId}`, href: "#", current: true }]}
    >
        <LimitedWidth>
      <div className="flex flex-col justify-between h-screen bg-white">
        {noCodeForm.closed ? (
          <div className="flex min-h-screen bg-ui-gray-light">
            <div className="flex flex-col justify-center flex-1 px-4 py-12 mx-auto sm:px-6 lg:flex-none lg:px-20 xl:px-24">
              <div className="w-full max-w-sm p-8 mx-auto lg:w-96">
                <div>
                  <Image
                    src="/img/snoopforms-logo.svg"
                    alt="snoopForms logo"
                    width={500}
                    height={89}
                  />
                </div>
                <div className="mt-8">
                  <h1 className="mb-4 font-bold text-center leading-2">
                    Form closed!
                  </h1>
                  <p className="text-center">
                    This form is closed for any further submissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-col" >
            <h1 className="text-2xl mt-5 mx-auto font-bold" >{noCodeForm.blocks[0].data.text}</h1>
            <table className="fixed mt-5 w-1/2
            ">

                <tbody className="w-full text-xl">
                    {
                        pages.map((page, index)=>{
                           if(pages.length-1!==index) return (
                            <tr key={index} className="w-full py-4 border-y-2 border-slate-100 flex justify-between">
                               <td className="pl-12">{(page.length)?"":page.blocks[0].data.text}</td>
                               <td className="flex w-1/4"><ClockIcon className="w-12 pr-5"/>{<button disabled={completed?true:false} className="w-107 rounded-full bg-green-800 p-2.5 text-white font-bold">{completed?"Complete":"Start"}</button>}</td>
                            </tr>
                            )
                        })    
                    }      
                </tbody>
            </table>
            {/* <ul>
                {
                pages.map((page, index)=>{
                    if(pages.length-1!==index) return <li key={index}>{(page.length)?"":page.blocks[0].data.text}</li>
                    console.log(`page length: ${page.length}`);
                    

                })
                }
            </ul> */}
          </div>
        )}
        {(publicPrivacyUrl || publicImprintUrl) && (
          <footer className="flex items-center justify-center w-full h-10 text-xs text-gray-300">
            {publicImprintUrl && (
              <>
                <a href={publicImprintUrl} target="_blank" rel="noreferrer">
                  Imprint
                </a>
              </>
            )}
            {publicImprintUrl && publicPrivacyUrl && (
              <span className="px-2">|</span>
            )}
            {publicPrivacyUrl && (
              <a href={publicPrivacyUrl} target="_blank" rel="noreferrer">
                Privacy Policy
              </a>
            )}
          </footer>
        )}
      </div>
      </LimitedWidth>
    </BaseLayoutManagement>
  );
}

NoCodeFormPublic.getInitialProps = () => {
  return {};
};

export default withAuthentication(NoCodeFormPublic);