import { Offline, Online } from "react-detect-offline";
import { Button, Label, TextInput, Card, Select, Alert } from 'flowbite-react';
import { NetworkMessage, NetworkTitle, customInputBoxTheme, customselectTheme, customsubmitTheme } from '@/app/customTheme/appTheme';
import { FormEvent, useEffect, useState } from 'react';
import { HiInformationCircle } from 'react-icons/hi';
import { useFetchProvinces } from "../_hooks/useFetch";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../DB/firebaseConnection";
import { failureMessage, successMessage } from "@/app/notifications/successError";
import { Areas } from "./Badges/Areas";

const TempAreas = () => {

    const { ProvinceData } = useFetchProvinces();
    const [yourTown, setYourTown] = useState("");
    const [yourProv, setYourProv] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [filteredTowns, setFilteredTowns] = useState([]);
    const [filteredDeleteTowns, setfilteredDeleteTowns] = useState([]);
    const [provId, setProvId] = useState<string>("");
    const [provDeleteId, setProvDeleteId] = useState<string>("");
    const [DBprovince, setDBprovince] = useState(ProvinceData);
    useEffect(() => {
        setDBprovince(ProvinceData);
    }, [ProvinceData]);

    const getProvId = (prov: string): string => {
        const province = DBprovince.find(it => it.province === prov);
        return province ? province.Id : "none";
    }

    const filterProvArray = (prov: string) => {

        setYourProv(prov);
        const id = getProvId(prov);
        setProvId(id);
        let filtered: any = [];
        filtered = DBprovince?.filter((itm) => itm.province?.trim()?.toLowerCase() === prov?.trim()?.toLowerCase());
        setFilteredTowns(filtered.length > 0 ? filtered[0].Towns : []);
        
    }

    // alllow delete
    const filterToDeleteProvArray = (prov: string) => {

        //setYourProv(prov);
        const id = getProvId(prov);
        setProvDeleteId(id);
        let filtered: any = [];
        filtered = DBprovince?.filter((itm) => itm.province?.trim()?.toLowerCase() === prov?.trim()?.toLowerCase());
        setfilteredDeleteTowns(filtered.length > 0 ? filtered[0].Towns : []);
        
    }
    const removeDuplicates = (array: any) => {
        const seen = new Set();
        return array.filter((item: any) => {
            const duplicate = seen.has(item.prov + item.area);
            seen.add(item.prov + item.area);
            return !duplicate;
        });
    };
    const submitDetails = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (yourProv.trim() == "" || yourProv.trim() == "---") return;
        // Filter duplicates and submit
        setIsProcessing(true);
        const uniqueTowns = removeDuplicates([...filteredTowns, { area: yourTown.trim(), prov: yourProv.trim() }]);
        setDoc(doc(db, 'Provinces', provId.trim()), { "Towns": uniqueTowns }, { merge: true }).then(() => {

            successMessage("Updated province");
            setIsProcessing(false);
            window?.location?.reload();
            //router.refresh();
        }).catch((error: any) => {
            setIsProcessing(false);
            failureMessage("Error: " + error?.message);
        });
    }

    return (
        <div className="flex flex-wrap">
            <form onSubmit={submitDetails}>
                <Card className='flex max-w-md gap-4 flex-grow mt-4 mb-4 ml-2'>
                    <h3 className="text-lg">Add Provinces and Towns</h3>

                    <p className="text-xs">Select a Province *</p>
                    {DBprovince?.length > 0 && (
                        <Select
                            onChange={(e) => filterProvArray(e.target.value)}
                            className="max-w-md"
                            id="Service"
                            theme={customselectTheme}
                            color={"success"}
                            required
                        >
                            <option>---</option>
                            {DBprovince.map(itm => (
                                <option key={itm?.Id}>{itm?.province.trim()}</option>
                            ))}
                        </Select>
                    )}

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="Town" value="Town In That Province *" />
                        </div>
                        <TextInput
                            value={yourTown}
                            onChange={(e) => setYourTown(e.target.value)}
                            theme={customInputBoxTheme}
                            color={"focuscolor"}
                            id="cmpName"
                            type="text"
                            placeholder="Provide One Town Found In That Province"
                            required
                            shadow
                        />
                    </div>

                    <Card>
                        <p className="text-xs">Addresses as captured on the Database (read-only)</p>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="Town" value="Addresses*" />
                            </div>
                            <Select id="addrSelector" className="max-w-md" theme={customselectTheme} color={"success"} required>
                                {ProvinceData?.map((item) => (
                                    <optgroup label={item.province} key={item.Id}>
                                        {item?.Towns?.map((ars, index) => (
                                            <option key={index}>{ars?.area}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </Select>
                        </div>
                    </Card>

                    <Alert color="warning" icon={HiInformationCircle}>
                        <span className="font-medium">Info alert! </span>Details to be Captured
                        <p className="text-xs text-gray-500">{"Province: " + yourProv}</p>
                        <p className="text-xs text-gray-500">{"Town: " + yourTown}</p>
                    </Alert>
                    <Online>
                        <Button isProcessing={isProcessing} disabled={isProcessing} theme={customsubmitTheme} type="submit" color="appsuccess">
                            Submit
                        </Button>
                    </Online>
                    <Offline>
                        <Alert color="failure" icon={HiInformationCircle}>
                            <span className="font-medium">Info alert! </span>{NetworkTitle}
                            <p className="text-xs text-gray-500">{NetworkMessage}</p>
                        </Alert>
                    </Offline>
                </Card>
            </form>

            <div className="max-w-md gap-4 flex-grow ml-2">
                
                <>
                    <p className="text-xs">Select a Province *</p>
                    <p className="text-xs">Click from the list of sub-areas that you want to remove</p>
                    {DBprovince?.length > 0 && (
                        <Select
                        onChange={(e) => filterToDeleteProvArray(e.target.value)}
                            className="max-w-md mb-2"
                            id="Service"
                            theme={customselectTheme}
                            color={"success"}
                            required
                        >
                            <option>---</option>
                            {DBprovince.map(itm => (
                                <option key={itm?.Id}>{itm?.province.trim()}</option>
                            ))}
                        </Select>
                    )}
                </>
                <Areas filteredDeleteTowns={filteredDeleteTowns} setfilteredDeleteTowns={setfilteredDeleteTowns} provDeleteId={provDeleteId} setProvDeleteId={setProvDeleteId} />
                
            </div>

        </div>
    );
}

export default TempAreas;