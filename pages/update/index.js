import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Update.module.css";
import { decrypt } from "../api/auth/lib";
import { Building2, CircleCheckBig, Clock4, Lock, OctagonX, UserCheck, Users } from "lucide-react";

export default function UpdateStatus({ payload, metadata_res, workflow_res }) {
    const [appMetadata, setAppMetadata] = useState([]);
    const [workflowLevels, setWorkflowLevels] = useState({})
    const [workflowLevelsData, SetWorkflowLevelsData] = useState({});
    const [formData, setFormData] = useState({
        APP_ID: '',
        CNTRL_ID: '',
        NOTES: '',
        RESULT: '',
        RESULT_REASON: '',
        PROCESS_STATUS: '',
        ARTIFACT_URL: '',
    })
    const [isUpdating, setIsUpdating] = useState(false);
    const [eachLevelInfo, setEachLevelInfo] = useState({
        pendingLevels: {},
        currentLevel: {},
        approvedLevel: {}
    });

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
            temp["LAST_UPDATED_DTTM"] = app[5];
            temp["ID"] = app[16];
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
        let showData = ['updated', 'inprog'];
        tempMetadata["APP_ID"] = metadata_res?.appData[0];
        tempMetadata["CNTRL_ID"] = metadata_res?.appData[2];
        tempMetadata["REGION_ID"] = metadata_res?.appData[1];
        tempMetadata["NOTES"] = metadata_res?.appData[8];
        tempMetadata["ARTIFACT_URL"] = metadata_res?.appData[7];
        tempMetadata["PROCESS_STATUS"] = metadata_res?.appData[9].toLowerCase();
        tempMetadata["RESULT"] = metadata_res?.appData[10];
        tempMetadata["RESULT_REASON"] = metadata_res?.appData[11];
        setAppMetadata(tempMetadata);
        setFormData({
            APP_ID: tempMetadata.APP_ID,
            CNTRL_ID: tempMetadata.CNTRL_ID,
            NOTES: showData.includes(tempMetadata["PROCESS_STATUS"]) ? tempMetadata["NOTES"] : '',
            RESULT: showData.includes(tempMetadata["PROCESS_STATUS"]) ? (tempMetadata["RESULT"] ? tempMetadata["RESULT"] : '') : 'NA',
            RESULT_REASON: showData.includes(tempMetadata["PROCESS_STATUS"]) ? tempMetadata["RESULT_REASON"] : '',
            PROCESS_STATUS: tempMetadata["PROCESS_STATUS"] ? tempMetadata["PROCESS_STATUS"] : '',
            ARTIFACT_URL: showData.includes(tempMetadata["PROCESS_STATUS"]) ? tempMetadata["ARTIFACT_URL"] : '',
            OWNER: payload.username ? payload.username : ''
        })
    }, [metadata_res, payload])

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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    useEffect(() => {
        let currentLevel = -1;
        Object.keys(workflowLevelsData).forEach((level) => {
            if (workflowLevelsData[level]["APPROVAL_WORKFLOW_USER"] === payload?.username) {
                currentLevel = parseInt(level);
                setEachLevelInfo((prev) => {
                    return {
                        ...prev,
                        currentLevel: parseInt(level)
                    }
                })
            }
        })

        let pendingUsers = {};
        Object.keys(workflowLevelsData).forEach((level) => {
            if (parseInt(level) < currentLevel && workflowLevelsData[level]["RESULT"] !== 'Green') {
                pendingUsers[parseInt(level)] = workflowLevelsData[level]
            }
        })

        let approvedUsers = {};
        Object.keys(workflowLevelsData).forEach((level) => {
            if (parseInt(level) > currentLevel && workflowLevelsData[level]["RESULT"] === "Green") {
                approvedUsers[parseInt(level)] = workflowLevelsData[level]
            }
        })

        setEachLevelInfo((prev) => {
            return {
                ...prev,
                pendingLevels: pendingUsers
            }
        })

        setEachLevelInfo((prev) => {
            return {
                ...prev,
                approvedLevel: approvedUsers
            }
        })
    }, [workflow_res, payload, workflowLevelsData])

    const handleSubmit = async (e) => {
        setIsUpdating(!isUpdating);
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:75/update-status', formData);
            console.log(response);
            setIsUpdating(!isUpdating);
            if (response.statusText === 'OK') {
                window.location.reload();
            }
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

    const cardItemStyles = (result) => {
        let styles = {};
        styles['border'] = result === 'Green' ? '2px solid rgb(0, 255, 0)' : result === 'Red' ? '2px solid rgb(255, 0, 0)' : '1px solid rgb(0, 0, 0)';
        return styles;
    }

    const statusIconStyles = (result) => {
        let styles = {};
        styles['color'] = result === 'Green' ? 'green' : result === 'Red' ? 'red' : '';
        return styles;
    }

    const processStyles = (result) => {
        let styles = {};
        styles['color'] = result === 'Green' ? 'green' : result === 'Red' ? 'red' : 'gray';
        return styles;
    }

    return (
        <div className={styles.updateContainer}>
            {
                Object.keys(eachLevelInfo.pendingLevels).length !== 0 && (
                    <div className={styles.pendingCardStyles}>
                        <div><Lock /></div>
                        <div>
                            Prior Levels
                            {Object.keys(eachLevelInfo.pendingLevels).map((level, lIndex) => {
                                return (
                                    <span
                                        style={{ background: 'gray', padding: '5px 10px', borderRadius: '5px', margin: '5px', fontSize: '20px' }}
                                        key={lIndex}
                                    >
                                        {eachLevelInfo.pendingLevels[level]['APPROVAL_WORKFLOW_USER']}
                                    </span>
                                )
                            })}
                            not yet Approved.</div>
                        <div>So you are not allowed to Approved.</div>
                    </div>
                )
            }
            {
                Object.keys(eachLevelInfo.approvedLevel).length !== 0 && (
                    <div className={styles.pendingCardStyles}>
                        <div><Lock /></div>
                        <div>
                            Your submisson is approved by
                            {Object.keys(eachLevelInfo.approvedLevel).map((level, lIndex) => {
                                return (
                                    <span
                                        style={{ background: 'gray', padding: '5px 10px', borderRadius: '5px', margin: '5px', fontSize: '20px' }}
                                        key={lIndex}
                                    >
                                        {eachLevelInfo.approvedLevel[level]['APPROVAL_WORKFLOW_USER']}
                                    </span>
                                )
                            })}
                        </div>
                        <div>So you are not allowed to edit it until they reject.</div>
                    </div>
                )
            }
            {
                Object.keys(eachLevelInfo.pendingLevels).length === 0 && (
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
                            <textarea rows={3}
                                value={formData.NOTES} type="text"
                                name="NOTES"
                                onChange={(e) => setFormData({
                                    ...formData,
                                    [e.target.name]: e.target.value
                                })} placeholder="Enter Notes"
                                style={{ cursor: Object.keys(eachLevelInfo.approvedLevel).length !== 0 ? 'not-allowed' : 'auto' }}
                                readOnly={Object.keys(eachLevelInfo.approvedLevel).length !== 0} />
                        </div>
                        <div className={styles.formElement}>
                            <label>Artifact URL</label>
                            <input value={formData.ARTIFACT_URL} type=" text"
                                name="ARTIFACT_URL"
                                onChange={(e) => setFormData({
                                    ...formData,
                                    [e.target.name]: e.target.value
                                })}
                                style={{ cursor: Object.keys(eachLevelInfo.approvedLevel).length !== 0 ? 'not-allowed' : 'auto' }}
                                readOnly={Object.keys(eachLevelInfo.approvedLevel).length !== 0}
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
                                    style={{ cursor: Object.keys(eachLevelInfo.approvedLevel).length !== 0 ? 'not-allowed' : 'auto', pointerEvents: Object.keys(eachLevelInfo.approvedLevel).length !== 0 ? 'none' : 'auto' }}
                                >
                                    <option value={formData.RESULT}>{formData.RESULT}</option>
                                    <option value="Green">Green</option>
                                    <option value="Yellow">Yellow</option>
                                    <option value="Red">Red</option>
                                </select>
                            </div>
                            <div className={styles.formElement}>
                                <label>RESULT_REASON</label>
                                <input value={formData.RESULT_REASON}
                                    onChange={(e) => handleChange(e)} type="text" id="RESULT_REASON" name="RESULT_REASON" required placeholder="Write your reason here"
                                    style={{ cursor: Object.keys(eachLevelInfo.approvedLevel).length !== 0 ? 'not-allowed' : 'auto' }}
                                    readOnly={Object.keys(eachLevelInfo.approvedLevel).length !== 0}
                                />
                            </div>
                        </div>
                        {
                            Object.keys(eachLevelInfo.approvedLevel).length === 0 && (
                                <div className={styles.submitButton} style={{
                                    pointerEvents: isUpdating ? 'none' : 'auto',
                                    opacity: isUpdating ? '0.5' : '1',
                                    cursor: isUpdating ? 'not-allowed' : 'auto'
                                }}>
                                    <input type="submit" value={'Update'} />
                                </div>
                            )
                        }
                    </form>
                )
            }
            <div className={styles.workflowContainer}>
                <div className={styles.workflowTitle}>
                    Track Approval workflow
                </div>
                <div className={styles.workflowCards}>
                    {
                        Object.keys(workflowLevelsData).map((key, index) => {
                            return (
                                <div className={styles.cardItem} key={index}
                                    style={cardItemStyles(workflowLevelsData[key].RESULT)}
                                >
                                    <div>
                                        <div style={statusIconStyles(workflowLevelsData[key].RESULT)}>
                                            {
                                                workflowLevelsData[key].RESULT === 'Green' ?
                                                    <CircleCheckBig /> :
                                                    workflowLevelsData[key].RESULT === 'Red' ?
                                                        <OctagonX /> : <Clock4 />
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.level}>
                                            Level {key}
                                        </div>
                                        <div className={styles.status}
                                            style={processStyles(workflowLevelsData[key].RESULT)}>
                                            {workflowLevelsData[key].RESULT === 'Green' ? 'Approved' : workflowLevelsData[key].RESULT === 'Red' ? 'Rejected' : 'Pending'}
                                        </div>
                                        <div className={styles.approver}>
                                            Approver:
                                            <span>
                                                {workflowLevelsData[key].APPROVAL_WORKFLOW_USER}
                                            </span>
                                        </div>
                                        {
                                            !(['NA', 'Pending'].includes(workflowLevelsData[key].RESULT)) &&
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