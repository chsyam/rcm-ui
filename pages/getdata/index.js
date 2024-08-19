import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "@/styles/AppData.module.css"

export default function GetData({ data }) {
    const router = useRouter();
    const [appMetadata, setAppMetadata] = useState([]);
    const [appControlsData, setAppControlsData] = useState([]);

    useEffect(() => {
        setAppMetadata(data?.appMetadata);
        setAppControlsData(data?.appData);
    }, [data])

    const handleDateFormat = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const formattedDay = day < 10 ? '0' + day : day;
        const formattedMonth = month < 10 ? '0' + month : month;
        return `${formattedDay}-${formattedMonth}-${year}`;
    }

    const getStyles = (status) => {
        let statusStyles = {
            color: 'white',
            textAlign: 'center',
            padding: '5px',
            borderRadius: '5px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }
        if (status === 'Updated') {
            statusStyles['backgroundColor'] = 'green'
        } else if (status === 'Update') {
            statusStyles['backgroundColor'] = 'blue'
        } else if (status === 'Overdue') {
            statusStyles['backgroundColor'] = 'red'
        } else if (status === 'Inprog') {
            statusStyles['backgroundColor'] = 'yellow',
                statusStyles['color'] = 'black'
        }
        return statusStyles;
    }

    const handleReportClick = (APP_ID) => {
        router.replace({
            pathname: '/report',
            query: { APP_ID: APP_ID }
        })
    }

    const handleUpdateStatus = (CNTRL_ID, APP_ID) => {
        router.replace({
            pathname: '/update',
            query: { CNTRL_ID: CNTRL_ID, APP_ID: APP_ID }
        })
    }

    return (
        <div>
            <Navbar />
            <div className={styles.menuSection}>
                <div className={styles.reportButton}
                    onClick={() => { handleReportClick(appMetadata[0]) }}
                >Report</div>
            </div>
            <div className={styles.appDataSection}>
                <table border={1}>
                    <tbody>
                        <tr>
                            <td>Application Id</td>
                            <td>{appMetadata[0]}</td>
                        </tr>
                        <tr>
                            <td>Application Name</td>
                            <td>{appMetadata[3]}</td>
                        </tr>
                        <tr>
                            <td>Application Brand</td>
                            <td>{appMetadata[2]}</td>
                        </tr>
                        <tr>
                            <td>Application Owner</td>
                            <td>{appMetadata[4]}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className={styles.appDataSection}>
                <table border={1}>
                    <thead>
                        <tr>
                            <th>Control Id</th>
                            <th>Last Update</th>
                            <th>Next Schedule</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            appControlsData.map((controlRow, index) =>
                            (
                                <tr key={index}>
                                    <td>{controlRow[2]}</td>
                                    <td>{handleDateFormat(controlRow[5])}</td>
                                    <td>{handleDateFormat(controlRow[4])}</td>
                                    <td>
                                        <div
                                            onClick={() => handleUpdateStatus(controlRow[2], controlRow[0], controlRow[8], controlRow[9], controlRow[10], controlRow[11], controlRow[7])}
                                            style={getStyles(controlRow[9])}
                                        >{controlRow[9]}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div >
    );
}

export async function getServerSideProps(context) {
    const params = context.query;
    console.log(params);

    try {
        const getAppMetadata = await axios.post('http://localhost:75/api/get-app-controls', params);
        return {
            props: {
                data: getAppMetadata.data
            }
        }
    } catch (error) {
        console.log(error);
        return {
            props: {
                data: []
            }
        }
    }
}