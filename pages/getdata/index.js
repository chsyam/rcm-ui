import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "@/styles/AppData.module.css"
import { decrypt } from "../api/auth/lib";

export default function GetData({ payload, metadata_res, workflow_res }) {
    console.log(workflow_res)
    console.log(payload)
    const router = useRouter();
    const [appMetadata, setAppMetadata] = useState([]);
    const [appControlsData, setAppControlsData] = useState([]);
    const [workflowDetails, setWorkflowDetails] = useState([])

    useEffect(() => {
        let temp = {};
        for (let i = 0; i < workflow_res.length; i++) {
            if (temp[workflow_res[i][2]])
                temp[workflow_res[i][2]].push(workflow_res[i][11])
            else
                temp[workflow_res[i][2]] = [workflow_res[i][11]]
        }
        setWorkflowDetails(temp);
    }, [workflow_res])

    useEffect(() => {
        console.log(workflowDetails)
    }, [workflowDetails])

    useEffect(() => {
        setAppMetadata(metadata_res?.appMetadata);
        setAppControlsData(metadata_res?.appData);
    }, [metadata_res])

    const handleDateFormat = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const formattedDay = day < 10 ? '0' + day : day;
        const formattedMonth = month < 10 ? '0' + month : month;
        return `${formattedDay}-${formattedMonth}-${year}`;
    }

    const getStyles = (CNTRL_ID, status, owner) => {
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
        if (owner !== payload?.username &&
            !(workflowDetails[CNTRL_ID] && workflowDetails[CNTRL_ID].includes(owner))
        ) {
            statusStyles['backgroundColor'] = 'none';
            statusStyles['color'] = 'black';
            statusStyles['border'] = '1px solid black';
            statusStyles['cursor'] = 'not-allowed';
        }
        return statusStyles;
    }

    const handleReportClick = (APP_ID) => {
        router.push({
            pathname: '/report',
            query: { APP_ID: APP_ID }
        })
    }

    const handleUpdateStatus = (CNTRL_ID, APP_ID, OWNER) => {
        if ((workflowDetails[CNTRL_ID] && workflowDetails[CNTRL_ID].includes(OWNER)) ||
            OWNER === payload?.username
        ) {
            router.push({
                pathname: '/update',
                query: { CNTRL_ID: CNTRL_ID, APP_ID: APP_ID }
            })
        } else {
            alert('You are not authorized to update this control');
            return;
        }
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
                                        <div onClick={() =>
                                            handleUpdateStatus(
                                                controlRow[2],
                                                controlRow[0],
                                                controlRow[12]
                                            )}
                                            style={getStyles(controlRow[2], controlRow[9], controlRow[12])}
                                        >
                                            {controlRow[9]}
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
    params["CNTRL_ID"] = "ALL";
    console.log(params);

    const { req, res } = context;
    const token = req?.cookies['token']
    const payload = await decrypt(token)
    if (!payload || payload === null || payload === undefined) {
        res.setHeader('Set-Cookie', [
            'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;',
        ]);

        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }
    let metadata_res = [];
    try {
        const res = await axios.post('http://localhost:75/api/get-app-controls', params);
        metadata_res = res.data;
    } catch (err) {
        console.log(err);
        metadata_res.data = []
    }

    let workflow_res = [];
    try {
        const res = await axios.post('http://localhost:75/workflow', params);
        workflow_res = res.data["workflowData"];
    } catch (err) {
        console.log(err);
        workflow_res.data = []
    }

    return {
        props: {
            payload: payload,
            metadata_res: metadata_res,
            workflow_res: workflow_res
        }
    }
}