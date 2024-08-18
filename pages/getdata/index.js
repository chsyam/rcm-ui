import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "@/styles/AppData.module.css"

export default function GetData({ resData }) {
    const router = useRouter();
    const appId = router.query.appName;
    const [appDataById, setAppDataById] = useState([]);
    const [controlsData, setControlsData] = useState([]);

    useEffect(() => {
        try {
            resData[0]['appsData'].map((app, index) => {
                app[0] === appId && setAppDataById(app);
            })
            let res = [];
            resData[0]['allApplicationData'].map((app, index) => {
                app[0] === appId && res.push(app);
            })
            setControlsData(res);
        } catch (error) {
            setControlsData([])
            setAppDataById([])
            console.log(error);
        }
    }, [appId, resData])

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
        if (status === 'Completed') {
            statusStyles['backgroundColor'] = 'green'
        } else if (status === 'Update') {
            statusStyles['backgroundColor'] = 'blue'
        } else if (status === 'Overdue') {
            statusStyles['backgroundColor'] = 'red'
        } else if (status === 'In Progress') {
            statusStyles['backgroundColor'] = 'yellow'
        }
        return statusStyles;
    }

    const handleReportClick = (appId) => {
        router.replace({
            pathname: '/report',
            query: { appId: appId }
        })
    }

    const handleUpdateStatus = (controlId, appId, notes, progress_status, result, resultReason) => {
        router.replace({
            pathname: '/update',
            query: { controlId: controlId, appId: appId, notes: notes, progress_status: progress_status, result: result, resultReason: resultReason }
        })
    }

    return (
        <div>
            <Navbar />
            <div className={styles.menuSection}>
                <div className={styles.reportButton} onClick={() => { handleReportClick(appDataById[0]) }}>Report</div>
            </div>
            <div className={styles.appDataSection}>
                <table border={1}>
                    <tbody>
                        <tr>
                            <td>Application Id</td>
                            <td>{appDataById[0]}</td>
                        </tr>
                        <tr>
                            <td>Application Name</td>
                            <td>{appDataById[3]}</td>
                        </tr>
                        <tr>
                            <td>Application Brand</td>
                            <td>{appDataById[2]}</td>
                        </tr>
                        <tr>
                            <td>Application Owner</td>
                            <td>{appDataById[4]}</td>
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
                            controlsData.map((controlRow, index) =>
                            (
                                <tr key={index}>
                                    <td>{controlRow[2]}</td>
                                    <td>{handleDateFormat(controlRow[5])}</td>
                                    <td>{handleDateFormat(controlRow[4])}</td>
                                    <td>
                                        <div onClick={() => handleUpdateStatus(controlRow[2], controlRow[0], controlRow[8], controlRow[9], controlRow[10], controlRow[11])} style={getStyles(controlRow[9])}>{controlRow[9]}</div>
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

export async function getServerSideProps() {
    try {
        const dashboardData = await axios.get(`http://localhost:75/app-data`);
        return {
            props: {
                resData: dashboardData.data
            }
        }
    } catch (error) {
        console.log(error);
        return {
            props: {
                dashboardData: []
            }
        }
    }
}