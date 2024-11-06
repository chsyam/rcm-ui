import { useRouter } from "next/router"
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import styles from "./Update.module.css";
import { decrypt } from "../api/auth/lib";

export default function UpdateStatus({ payload, metadata_res, workflow_res }) {
    const router = useRouter();
    const params = router.query;
    const showData = ['Updated', 'InProg'];
    const [appMetadata, setAppMetadata] = useState([]);
    const [appData, setAppData] = useState([]);
    const [workflow, setWorkflow] = useState([]);
    const [workflowLevels, setWorkflowLevels] = useState({})
    const [restrictMessages, setRestrictMessages] = useState([]);
    const [pendingUSers, setPendingUsers] = useState([]);

    const [upperLevelForCurrent, setUpperLevelForCurrent] = useState({
        username: '',
        level: -1,
        status: ''
    });

    const [currentUser, setCurrentUser] = useState({
        username: 'admin',
        level: 1,
        status: 'NA'
    })

    useEffect(() => {
        for (let i = 0; i < workflow_res.length; i++) {
            if (workflow_res[i][11] === payload.username) {
                setCurrentUser({
                    username: workflow_res[i][11],
                    level: workflow_res[i][15],
                    status: workflow_res[i][8]
                })
            }
        }
    }, [payload, workflow_res])

    useEffect(() => {
        let temp = {};
        for (let i = 0; i < workflow_res.length; i++) {
            temp[workflow_res[i][15]] = {
                username: workflow_res[i][11],
                level: workflow_res[i][15],
                status: workflow_res[i][8]
            };
        }
        setWorkflowLevels(temp);
    }, [workflow_res])

    useEffect(() => {
        setAppMetadata(metadata_res?.appMetadata);
        setAppData(metadata_res?.appData);
    }, [metadata_res])

    useEffect(() => {
        setWorkflow(workflow_res)
    }, [workflow_res])

    const changeStatusToPending = (usersToPending) => {
        console.log("Changing these status to pending", usersToPending)
    }

    const handleRestrictingUpperLevel = () => {
        console.log("Restricting upper level becuase prior level not yet approved")
    }

    useEffect(() => {
        console.log("pendingUSers", pendingUSers)
        if (pendingUSers.length > 0) {
            changeStatusToPending(pendingUSers);
        }
    }, [pendingUSers])

    useEffect(() => {
        let temp = [];
        for (let i = 0; i < workflow_res.length; i++) {
            if (currentUser.status === workflow_res[i][8] + 1) {
                setUpperLevelForCurrent({
                    username: workflow_res[i][11],
                    level: workflow_res[i][15],
                    status: workflow_res[i][8]
                })
            }
        }
        for (let i = 0; i < workflow_res.length; i++) {
            if (currentUser.status === 'NA' && currentUser.level > workflow_res[i][15] && workflow_res[i][8] === 'NA') {
                temp.push(workflow_res[i][11])
            }
        }
        setPendingUsers(temp)
    }, [currentUser.level, currentUser, workflow_res])

    const [formData, setFormData] = useState({
        APP_ID: params.APP_ID ? params.APP_ID : '',
        CNTRL_ID: params.CNTRL_ID ? params.CNTRL_ID : "",
        NOTES: showData.includes(appData[9]) ? appData[8] : '',
        RESULT: showData.includes(appData[9]) ? (appData[10] ? appData[10] : '') : 'select',
        RESULT_REASON: showData.includes(appData[9]) ? appData[11] : '',
        PROCESS_STATUS: appData[9] ? appData[9] : '',
        ARTIFACT_URL: showData.includes(appData[9]) ? appData[7] : ''
    })

    // useEffect(() => {
    //     function handleFormData() {
    //         const newFormData = {
    //             ...formData,
    //             NOTES: showData.includes(appData[9]) ? appData[8] : '',
    //             RESULT: showData.includes(appData[9]) ? appData[10] || "none" : 'select',
    //             RESULT_REASON: showData.includes(appData[9]) ? appData[11] : '',
    //             PROCESS_STATUS: appData[9] || '',
    //             ARTIFACT_URL: showData.includes(appData[9]) ? appData[7] : ''
    //         };

    //         if (JSON.stringify(formData) !== JSON.stringify(newFormData)) {
    //             setFormData(newFormData);
    //         }
    //     }
    //     handleFormData();
    // }, [appData, formData, showData]);

    const handleChange = (e) => {
        console.log(e.target.name, e.target.value)
        console.log(formData)
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    useEffect(() => {
        if (currentUser.status === 'NA') {
            if (workflowLevels[currentUser.level - 1] !== undefined && workflowLevels[currentUser.status - 1]?.status === 'NA') {
                console.log("Not allowed to change")
            } else {
                console.log("You are allowed to change the updated status becuase you are the first one to start");
            }
        } else if (currentUser.status !== 'NA') {
            if (workflowLevels[currentUser.level + 1] !== undefined) {
                console.log("you are allowed to change");
            }
            console.log("You are not allowed to change the updated status becuase you are not the first one to start");
        }
    }, [currentUser, workflowLevels])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (upperLevelForCurrent.username === '' ||
            upperLevelForCurrent.username !== '' && upperLevelForCurrent.status === 'NA'
        ) {
            console.log("You are allowed to change the updated status becuase upper level not yet approved")
        } else if (upperLevelForCurrent.username !== '' & upperLevelForCurrent.status !== 'NA') {
            console.log("You are not allowed to change the updated status becuase upper level already approved")
        }
        console.log("changing the updated status", formData.PROCESS_STATUS)
        console.log(formData);
        try {
            const response = await axios.post('http://localhost:75/update-status', formData);
            console.log(response);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const getFormatedDate = (date) => {
        const dateObj = new Date(date);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('en-US', options);
        return formattedDate;
    }

    return (
        <div>
            <Navbar />
            <div className={styles.formSection}>
                {
                    pendingUSers.length > 0 ?
                        (
                            pendingUSers.map((user, index) =>
                                <div key={index}>{`${user} yet to be approved`}</div>
                            )
                        ) : (
                            <form className={styles.form} onSubmit={(e) => handleSubmit(e)}>
                                <div className={styles.flexBlock}>
                                    <div className={styles.formElement}>
                                        <label htmlFor="APP_ID">App Id</label><br />
                                        <input value={formData.APP_ID}
                                            onChange={(e) => handleChange(e)}
                                            type="text" id="APP_ID" name="APP_ID" readOnly={true}
                                            style={{ cursor: 'not-allowed' }}
                                        />
                                    </div>
                                    <div className={styles.formElement}>
                                        <label htmlFor="CNTRL_ID">Control Id</label><br />
                                        <input value={formData.CNTRL_ID} onChange={(e) => handleChange(e)} type="text" id="CNTRL_ID" name="CNTRL_ID" readOnly={true}
                                            style={{ cursor: 'not-allowed' }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.formElement}>
                                    <label htmlFor="NOTES">Notes</label><br />
                                    <textarea rows={1}
                                        value={formData.NOTES}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            [e.target.name]: e.target.value
                                        })}
                                        type="text" id="NOTES" name="NOTES" required
                                    />
                                </div>
                                <div className={styles.formElement}>
                                    <label htmlFor="ARTIFACT_URL">Artifact URL</label><br />
                                    <textarea rows={1}
                                        value={formData.ARTIFACT_URL}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            [e.target.name]: e.target.value
                                        })} type="text" id="ARTIFACT_URL" name="ARTIFACT_URL" required
                                    />
                                </div>
                                <div className={styles.formElement}>
                                    <label htmlFor="RESULT_REASON">Result Reason</label><br />
                                    <textarea rows={1}
                                        value={formData.RESULT_REASON}
                                        onChange={(e) => handleChange(e)} type="text" id="RESULT_REASON" name="RESULT_REASON" required />
                                </div>
                                <div className={styles.formElement}>
                                    <label htmlFor="RESULT">Result</label><br />
                                    <select
                                        defaultChecked={formData.RESULT}
                                        id="RESULT" name="RESULT"
                                        onChange={(e) => setFormData({
                                            ...formData, RESULT: e.target.value
                                        })}
                                    >
                                        <option value='none'>Select</option>
                                        <option
                                            // selected={formData.RESULT === 'Green' ? true : false}
                                            value='Green'
                                        >
                                            Green
                                        </option>
                                        <option
                                            // selected={formData.RESULT === 'Yellow' ? true : false}
                                            value='Yellow'
                                        >
                                            Yellow
                                        </option>
                                        <option
                                            // selected={formData.RESULT === 'Red' ? true : false}
                                            value='Red'
                                        >
                                            Red
                                        </option>
                                    </select>
                                </div>
                                <div className={styles.submitButton}>
                                    <button type="submit">Update</button>
                                </div>
                            </form>
                        )
                }

                <div className={styles.workflowContainer}>
                    {
                        workflow.map((item, index) =>
                            <table key={index} className={styles.workflowItem}>
                                <tbody>
                                    <tr>
                                        <td className={styles.workflowItemTitle}>
                                            username:
                                        </td>
                                        <td className={styles.workflowItemValue}>
                                            {item[11]}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={styles.workflowItemTitle}>
                                            Status:
                                        </td>
                                        <td className={styles.workflowItemValue}>
                                            {item[8] === 'NA' ? 'Pending' : item[8]}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={styles.workflowItemTitle}>
                                            Submitted On:
                                        </td>
                                        <td className={styles.workflowItemValue}>
                                            {getFormatedDate(item[5])}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )
                    }
                </div>
            </div >
        </div >
    )
}

export async function getServerSideProps(context) {
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

    const params = context.query;
    console.log(params);
    let workflow_res = [];
    try {
        const res = await axios.post('http://localhost:75/workflow', params);
        workflow_res = res.data["workflowData"];
    } catch (err) {
        console.log(err);
        workflow_res.data = []
    }

    let metadata_res = [];
    try {
        const res = await axios.post('http://localhost:75/app-data', params);
        metadata_res = res.data;
    } catch (err) {
        console.log(err);
        metadata_res.data = []
    }

    return {
        props: {
            payload: payload,
            metadata_res: metadata_res,
            workflow_res: workflow_res
        }
    }
}