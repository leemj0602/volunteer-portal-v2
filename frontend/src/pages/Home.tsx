import { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import Wrapper from '../components/Wrapper';
import { useSubtypesContext } from '../contexts/Subtypes';
import Volunteer from './Volunteer/Dashboard';
import Caregiver from './Caregiver/Dashboard';
import Patient from './Patient/Dashboard';
import Donations from './Donations/Dashboard';

export default function Home() {
  const { subtypes } = useSubtypesContext()!;
  const [priority, setPriority] = useState<string>();
  useEffect(() => {
    if (subtypes) setPriority(subtypes[0]);
  }, [subtypes]);

  return !priority ? <Wrapper>
    <Loading className='h-screen items-center' />
  </Wrapper> : <>
    {priority == 'Volunteer' && <Volunteer />}
    {priority == 'Donator' && <Donations />}
    {priority == 'Caregiver' && <Caregiver />}
    {priority == 'Patient' && <Patient />}
  </>
}