import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import { Montserrat } from "next/font/google";
import "./globals.css";
import BootstrapClient from '@/component/BootstrapClient'
import Base from '@/component/Base';
import {CustomChainProvider} from '@/context/CustomChainProvider/CustomChainProvider'
import { Provider } from "jotai";
import "@interchain-ui/react/styles";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Clod Cost",
  description: "Get cost insights Akash Network",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
      <Provider>
      <CustomChainProvider>
        <Base children={children}/>
        </CustomChainProvider>
      </Provider>
        <BootstrapClient/>
      </body>
    </html>
  );
}
