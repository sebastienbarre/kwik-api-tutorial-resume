import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  HandThumbUpIcon,
  LifebuoyIcon,
  MapPinIcon,
  PhoneIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";
import { FixedScaleAxis, LineChart } from "chartist";
import React, { useEffect } from "react";
import { endOfMonth, format, parseISO, subMonths } from "date-fns";

import { ME_QUERY } from "./meQuery";
import clsx from "clsx";
import { useQuery } from "@apollo/client";

/**
 * Section component (such as Contact, Education, Trainings, etc.)
 */
const Section = ({ name, children, className, ...props }) => (
  <div className={clsx("flex flex-col gap-2", className)} {...props}>
    <h2 className="text-xl font-bold uppercase">{name}</h2>
    {children}
  </div>
);

/**
 * An Item in a Section component (such as a phone number, employee email, etc.)
 */
const SectionItem = ({ icon, className, children, ...props }) => (
  <div className={clsx("flex flex-row items-center gap-2 text-base", className)} {...props}>
    {icon && React.cloneElement(icon, { className: "h-4 w-4 shrink-0 text-sky-700" })}
    <div>{children}</div>
  </div>
);

/**
 * Profile picture component
 */
const ProfilePicture = ({
  employee: { profilePicture, fakeProfilePicture },
  className,
  ...props
}) => (
  <img
    src={profilePicture /* or profilePicture or fakeProfilePicture */}
    className={clsx("rounded-full w-52 mx-auto", className)}
    {...props}
  />
);

/**
 * Header component (displaying name, title, team)
 */
const Header = ({ employee: { byname, lastName, jobTitle, team }, className, ...props }) => (
  <div className={clsx("flex flex-col gap-2 justify-center", className)} {...props}>
    <h1 className="text-5xl font-bold">{byname}</h1>
    <h1 className="text-5xl font-bold">{lastName}</h1>
    <div className="flex flex-col gap-1">
      <p className="text-2xl text-sky-700">{jobTitle}</p>
      <p className="text-2xl">{team.name === "Indirect" ? "Support" : team.name} @ Kitware</p>
    </div>
  </div>
);

/**
 * Contract section component (displaying phone, email, office, city, state)
 */
const Contact = ({ employee: { workPhone, email, office, city, state }, ...props }) => (
  <Section name="Contact" {...props}>
    <SectionItem icon={<PhoneIcon />}>
      {workPhone?.number ?? "(518) 371-3971"}
      {workPhone?.extension ? ` x${workPhone?.extension}` : null}
    </SectionItem>
    <SectionItem icon={<EnvelopeIcon />}>{email}</SectionItem>
    <SectionItem icon={<MapPinIcon />}>
      {office?.nickname ?? "Remote"}, {city}, {state}
    </SectionItem>
    <SectionItem icon={<GlobeAltIcon />}>http://kitware.com</SectionItem>
  </Section>
);

/**
 * Education section component (displaying list of education items, i.e. degree/alma mater pairs)
 */
const Education = ({ employee: { education }, ...props }) => (
  <Section name="Education" {...props}>
    {education.edges.map(({ node }, index) => (
      <SectionItem key={index} icon={<AcademicCapIcon />}>
        <span className="capitalize">{node.degrees.join(" • ").toLowerCase()}</span> |{" "}
        {node.almaMater.name}
      </SectionItem>
    ))}
  </Section>
);

/**
 * Trainings section component (displaying list of trainings)
 */
const Trainings = ({ employee: { trainings }, ...props }) => (
  <Section name="Trainings" {...props}>
    <SectionItem icon={<TrophyIcon />}>{trainings.join(" • ")}</SectionItem>
  </Section>
);

/**
 * Roles section component (displaying count of employee being mentored or managed)
 */
const Roles = ({ employee: { managedEmployeesCount, mentoredEmployeesCount }, ...props }) => (
  <Section name="Roles" {...props}>
    {managedEmployeesCount.totalCount > 0 && (
      <SectionItem icon={<HandThumbUpIcon />}>
        Managed {managedEmployeesCount.totalCount}{" "}
        {managedEmployeesCount.totalCount > 1 ? "employees" : "employee"}
      </SectionItem>
    )}
    {mentoredEmployeesCount.totalCount > 0 && (
      <SectionItem icon={<LifebuoyIcon />}>
        Mentored {mentoredEmployeesCount.totalCount}{" "}
        {mentoredEmployeesCount.totalCount > 1 ? "employees" : "employee"}
      </SectionItem>
    )}
  </Section>
);

/**
 * Work Experience section component (displaying start year at Kitware, and previous experience)
 */
const WorkExperience = ({ employee: { tenure }, ...props }) => (
  <Section name="Work Experience" {...props}>
    <SectionItem icon={<ArrowRightIcon />}>
      Kitware | {tenure.currentExperienceAdjustedDateRange.startDate.substr(0, 4)} to now
    </SectionItem>
    <SectionItem icon={<ArrowLeftIcon />}>
      {tenure.previousExperience
        ? `Previous experience: ${(tenure.previousExperience / 12).toFixed(1)} years`
        : "No previous experience"}
    </SectionItem>
  </Section>
);

/**
 * Top Projects section component (displaying projects the employee spent the most hours on)
 */
const TopProjects = ({ employee: { topProjects }, ...props }) => (
  <Section name={`Top ${topProjects.edges.length} Projects (2022-2023)`} {...props}>
    {topProjects.edges.map(({ node }, index) => (
      <SectionItem key={index} icon={<ClockIcon />}>
        {node.project.parentProject?.name ?? node.project.name} ({parseFloat(node.hours).toFixed(0)}{" "}
        hrs)
      </SectionItem>
    ))}
  </Section>
);

/**
 * Build the chart, given hours per month worked in 2023 and 2022
 */
const buildChart = ({ hours2023, hours2022 }) => {
  const nodeToPoint = ({ hours, datePeriod }) => ({
    x: parseISO("2023-" + datePeriod.midpoint.substr(5, 5)), // yyyy-mm-dd to 2023-mm-dd
    y: hours,
  });
  const data2023 = hours2023?.edges.map(({ node }) => nodeToPoint(node)) ?? [];
  const data2022 = hours2022?.edges.map(({ node }) => nodeToPoint(node)) ?? [];
  if (data2023.length === 0 && data2022.length === 0) {
    return;
  }
  new LineChart(
    "#chart",
    {
      series: [
        { name: "series-2023", data: data2023 },
        { name: "series-2022", data: data2022 },
      ],
    },
    {
      low: 0,
      // showPoint: false,
      axisX: {
        type: FixedScaleAxis,
        divisor: 6,
        low: parseISO("2023-01-01").getTime(),
        high: parseISO("2023-12-31").getTime(),
        // showGrid: false,
        // showLabel: false,
        labelInterpolationFnc: (value) =>
          new Date(value).toLocaleString(undefined, {
            month: "short",
          }),
      },
    }
  );
};

/**
 * Hours by Month section component (displaying chart of 2022 hours vs 2023 hours, by month)
 */
const HoursByMonth = ({ employee, ...props }) => {
  useEffect(() => employee && buildChart(employee), [employee]);
  const name = (
    <>
      Hours/mo (<span className="text-yellow-500">2022</span> vs{" "}
      <span className="text-green-500">2023</span>)
    </>
  );
  return (
    <Section name={name} {...props}>
      <div id="chart" className="h-[17rem]"></div>
    </Section>
  );
};

/**
 * The whole Resume component
 */
const Resume = ({ employee, className, ...props }) => (
  <div
    className={clsx(
      "h-screen text-slate-800 text-base pb-6 flex flex-row w-[50rem] mx-auto overflow-scroll",
      className
    )}
    {...props}
  >
    <div className="w-2/5 flex flex-col bg-sky-100 rounded-b-full p-6 gap-6">
      <ProfilePicture employee={employee} />
      <Contact employee={employee} />
      <Education employee={employee} />
      <Trainings employee={employee} />
      <Roles employee={employee} />
    </div>
    <div className="w-3/5 flex flex-col gap-6 p-6">
      <Header employee={employee} className="h-52" />
      <WorkExperience employee={employee} />
      {employee.topProjects.totalCount > 0 && <TopProjects employee={employee} />}
      {(employee.hours2023.totalCount > 0 || employee.hours2022.totalCount > 0) && (
        <HoursByMonth employee={employee} />
      )}
    </div>
  </div>
);

/**
 * Our app
 */
export default function App() {
  const variables = {
    endOfLastMonth: format(endOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"),
  };

  const { loading, error, data } = useQuery(ME_QUERY, { variables });
  const employee = data?.me;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;
  return <Resume employee={employee} />;
}
