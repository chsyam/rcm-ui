import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Update.module.css";
import { decrypt } from "../api/auth/lib";
import { Building2, CircleCheckBig, Clock4, UserCheck, Users } from "lucide-react";

export default function UpdateStatus({ payload, metadata_res, workflow_res }) {
    const [appMetadata, setAppMetadata] = useState([]);
    const [workflowLevels, setWorkflowLevels] = useState({})
    const [pendingUSers, setPendingUsers] = useState([]);
    const [workflowLevelsData, SetWorkflowLevelsData] = useState({});
    const [formData, setFormData] = useState({
        APP_ID: '',
        CNTRL_ID: '',
        NOTES: '',
        RESULT: '',
        RESULT_REASON: '',
        PROCESS_STATUS: '',
        ARTIFACT_URL: ''
    })
    const [summary, setSummary] = useState({
        count_approvers: 0,
        levelsCount: 0,
        approvedCount: 0
    })

    useEffect(() => {
        setSummary({
            count_approvers: 0,
            levelsCount: 0,
            approvedCount: 0
        })
        workflow_res.forEach((app, index) => {
            let temp = {};
            temp["APP_ID"] = app[0];
            temp["REGION_ID"] = app[1];
            temp["CNTRL_ID"] = app[2];
            temp["SCHEDULED_DATES"] = app[4];
            temp["RESULT"] = app[8];
            temp["RESULT_REASON"] = app[9];
            temp["OWNER"] = app[10];
            temp["APPROVAL_WORKFLOW_USER"] = app[11];
            temp["is_submitted"] = app[12];
            temp["is_updated"] = app[13];
            temp["workflow_level"] = app[15];
            temp["LAST_UPDATED_DTTM"] = app[5]
            setSummary((prev) => {
                return {
                    ...prev,
                    count_approvers: prev.count_approvers + 1,
                    levelsCount: prev.levelsCount + 1,
                    approvedCount: prev.approvedCount + (app[8] === 'Green' ? 1 : 0)
                }
            })
            SetWorkflowLevelsData((prev) => {
                return {
                    ...prev,
                    [app[15]]: temp
                }
            })
        })
    }, [metadata_res, workflow_res])

    useEffect(() => {
        let tempMetadata = {};
        let showData = ['Updated', 'InProg'];

        tempMetadata["APP_ID"] = metadata_res?.appData[0];
        tempMetadata["CNTRL_ID"] = metadata_res?.appData[2];
        tempMetadata["REGION_ID"] = metadata_res?.appData[1];
        tempMetadata["NOTES"] = metadata_res?.appData[8];
        tempMetadata["ARTIFACT_URL"] = metadata_res?.appData[7];
        tempMetadata["PROCESS_STATUS"] = metadata_res?.appData[9];
        tempMetadata["RESULT"] = metadata_res?.appData[10];
        tempMetadata["RESULT_REASON"] = metadata_res?.appData[11];
        setAppMetadata(tempMetadata);

        setFormData({
            APP_ID: tempMetadata.APP_ID,
            CNTRL_ID: tempMetadata.CNTRL_ID,
            NOTES: showData.includes(tempMetadata["PROCESS_STATUS"]) ? tempMetadata["NOTES"] : '',
            RESULT: showData.includes(tempMetadata["PROCESS_STATUS"]) ? (tempMetadata["RESULT"] ? tempMetadata["RESULT"] : '') : 'Select',
            RESULT_REASON: showData.includes(tempMetadata["PROCESS_STATUS"]) ? tempMetadata["RESULT_REASON"] : '',
            PROCESS_STATUS: tempMetadata["PROCESS_STATUS"] ? tempMetadata["PROCESS_STATUS"] : '',
            ARTIFACT_URL: showData.includes(tempMetadata["PROCESS_STATUS"]) ? tempMetadata["ARTIFACT_URL"] : ''
        })
    }, [metadata_res])

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
        <div className={styles.updateContainer}>
            {
                pendingUSers.length > 0 ?
                    pendingUSers.map((user, index) =>
                        <div key={index}>{`${user} yet to be approved`}</div>
                    ) :
                    <form className={styles.formContainer} onSubmit={(e) => handleSubmit(e)}>
                        <div className={styles.formGroup}>
                            <div className={styles.formElement}>
                                <label>APP ID</label> <br />
                                <input value={formData.APP_ID} type="text" name="APP_ID" readOnly={true} placeholder="Enter APP ID" style={{ cursor: 'not-allowed' }} />
                            </div>
                            <div className={styles.formElement}>
                                <label>Control ID</label> <br />
                                <input value={formData.CNTRL_ID} type="text" name="CNTRL_ID" placeholder="CNTRL_ID" readOnly={true} style={{ cursor: 'not-allowed' }} />
                            </div>
                        </div>
                        <div className={styles.formElement}>
                            <label>Notes</label> <br />
                            <textarea rows={3} value={formData.NOTES} type="text"
                                name="NOTES"
                                onChange={(e) => setFormData({
                                    ...formData,
                                    [e.target.name]: e.target.value
                                })} placeholder="Enter Notes" />
                        </div>
                        <div className={styles.formElement}>
                            <label>Artifact URL</label>
                            <input value={formData.ARTIFACT_URL} type=" text"
                                name="ARTIFACT_URL"
                                onChange={(e) => setFormData({
                                    ...formData,
                                    [e.target.name]: e.target.value
                                })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <div className={styles.formElement}>
                                <label>Result</label> <br />
                                <select defaultValue={formData.RESULT}
                                    name="RESULT"
                                    onChange={(e) => setFormData({
                                        ...formData, RESULT: e.target.value
                                    })}
                                >
                                    <option value="none">Select</option>
                                    <option selected={formData.RESULT === 'Green'} value="Green">Green</option>
                                    <option selected={formData.RESULT === 'Yellow'} value="Yellow">Yellow</option>
                                    <option selected={formData.RESULT === 'Red'} value="Red">Red</option>
                                </select>
                            </div>
                            <div className={styles.formElement}>
                                <label>RESULT_REASON</label>
                                <input value={formData.RESULT_REASON}
                                    onChange={(e) => handleChange(e)} type="text" id="RESULT_REASON" name="RESULT_REASON" required placeholder="Write your reason here" />
                            </div>
                        </div>
                        <div className={styles.submitButton}>
                            <input type="submit" value={'Update'} />
                        </div>
                    </form>
            }
            <div className={styles.workflowContainer}>
                <div className={styles.workflowTitle}>
                    Track Approval workflow
                </div>
                <div className={styles.workflowCards}>
                    {
                        Object.keys(workflowLevelsData).map((key, index) => {
                            return (
                                <div className={styles.cardItem} key={index}>
                                    <div>
                                        <div style={{ backgroundColor: workflowLevelsData[key].RESULT === 'Green' ? '#ccffcc' : '#cce5ff' }} className={styles.statusIcon}>
                                            {
                                                workflowLevelsData[key].RESULT === 'NA' ?
                                                    <Clock4 /> : <CircleCheckBig />
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.level}>
                                            Level {key}
                                        </div>
                                        <div className={styles.status}
                                            style={{ color: workflowLevelsData[key].RESULT === 'Green' ? 'green' : 'gray' }}
                                        >
                                            {workflowLevelsData[key].RESULT === 'NA' ? 'Pending' : workflowLevelsData[key].RESULT}
                                        </div>
                                        <div className={styles.approver}>
                                            Approver:
                                            <span>
                                                {workflowLevelsData[key].APPROVAL_WORKFLOW_USER}
                                            </span>
                                        </div>
                                        {
                                            workflowLevelsData[key].RESULT === 'NA' &&
                                            <div className={styles.approvedOn}>
                                                Approved On:
                                                <span>
                                                    {getFormatedDate(workflowLevelsData[key].LAST_UPDATED_DTTM)}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className={styles.summaryContainer}>
                <div className={styles.sectionTitle}>Workflow Summary</div>
                <div className={styles.summaryItems}>
                    <div>
                        <UserCheck /> {`${summary.approvedCount}/${summary.levelsCount} Approved`}
                    </div>
                    <div>
                        <Users /> {`${summary.count_approvers} Approvers`}
                    </div>
                    <div>
                        <Building2 />{`${summary.levelsCount} Levels`}
                    </div>
                </div>
            </div>
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
    // console.log(params);
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