import Navbar from "@/components/Navbar";
import axios from "axios";
import { useEffect, useState } from "react";
import styles from "@/styles/AppData.module.css"

export default function AppReport({ all_logs }) {
    const [reportData, setReportData] = useState([]);
    const [appMetadata, setAppMetadata] = useState([]);
    try {
        useEffect(() => {
            setReportData(all_logs[0]?.report);
            setAppMetadata(all_logs[0]?.appMetadata)
        }, [all_logs])
    } catch (error) {
        setReportData([]);
        setAppMetadata([]);
        console.log(error);
    }

    return (
        <div>
            <Navbar />
            <div className={styles.appDataSection}>
                <table border={1}>
                    <tbody>
                        <tr>
                            <td>Application Id</td>
                            <td>{appMetadata && appMetadata[0]}</td>
                        </tr>
                        <tr>
                            <td>Application Name</td>
                            <td>{appMetadata && appMetadata[3]}</td>
                        </tr>
                        <tr>
                            <td>Application Brand</td>
                            <td>{appMetadata && appMetadata[2]}</td>
                        </tr>
                        <tr>
                            <td>Application Owner</td>
                            <td>{appMetadata && appMetadata[4]}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className={styles.appDataSection} >
                <table border={1}>
                    <thead>
                        <tr>
                            <th>Control ID</th>
                            <th>Artifact URL</th>
                            <th>Note</th>
                            <th>Updated Status</th>
                            <th>Last Updated At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reportData?.map((report, index) =>
                                <tr key={index}>
                                    <td>{report[2]}</td>
                                    <td>{report[7]}</td>
                                    <td>{report[8]}</td>
                                    <td>{report[9]}</td>
                                    <td>{report[15]}</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div >
    )
}

export async function getServerSideProps(context) {
    const { APP_ID } = context.query;
    try {
        const appReport = await axios.get(`http://localhost:75/report`, {
            params: { APP_ID }
        });

        console.log("appReport.data", appReport.data);
        return {
            props: {
                all_logs: appReport.data
            }
        }
    } catch (error) {
        console.log(error);
        return {
            props: {
                all_logs: []
            }
        }
    }
}