import { gql } from "@apollo/client";

export const EMPLOYEE_FRAGMENT = gql`
  fragment timeEntriesTotalsForDatePeriodFields on TimeEntriesTotalsInterfacePaginationConnection {
    totalCount
    edges {
      node {
        hours
        ... on TimeEntriesTotalsForDatePeriod {
          datePeriod {
            midpoint
          }
        }
      }
    }
  }

  fragment employeeFields on Employee {
    profilePicture
    fakeProfilePicture: profilePicture(fake: DICEBEAR_MICAH)
    byname
    lastName
    jobTitle
    email
    city
    state
    office {
      nickname
    }
    workPhone {
      number
      extension
    }
    team {
      name
    }
    trainings
    tenure {
      currentExperienceAdjustedDateRange {
        startDate
      }
      previousExperience
    }
    education(pagination: { first: 5 }) {
      edges {
        node {
          degrees
          almaMater {
            name
          }
        }
      }
    }
    topProjects: timeEntriesTotalsAggregated(
      aggregationMode: BY_PROJECT
      filters: {
        date: { between: ["2022-01-01", "2023-12-31"] }
        chargedToVacationProject: { eq: false }
      }
      sorts: [{ hours: DESCENDING }]
      pagination: { first: 5 }
    ) {
      totalCount
      edges {
        node {
          hours
          ... on TimeEntriesTotalsForProject {
            project {
              name
              parentProject {
                name
              }
            }
          }
        }
      }
    }
    hours2023: timeEntriesTotalsAggregated(
      aggregationMode: BY_DATE_PERIOD
      periodicity: MONTHLY
      filters: {
        date: { between: ["2023-01-01", $endOfLastMonth] }
        chargedToVacationProject: { eq: false }
      }
      sorts: [{ datePeriod: ASCENDING }]
    ) {
      ...timeEntriesTotalsForDatePeriodFields
    }
    hours2022: timeEntriesTotalsAggregated(
      aggregationMode: BY_DATE_PERIOD
      periodicity: MONTHLY
      filters: {
        date: { between: ["2022-01-01", "2022-12-31"] }
        chargedToVacationProject: { eq: false }
      }
      sorts: [{ datePeriod: ASCENDING }]
    ) {
      ...timeEntriesTotalsForDatePeriodFields
    }
    mentoredEmployeesCount: employeesWithRoles(
      filters: { roles: { in: [ONBOARDING_MENTOR, DEPARTMENT_MENTOR] } }
    ) {
      totalCount
    }
    managedEmployeesCount: employeesWithRoles(filters: { roles: { in: [MANAGER] } }) {
      totalCount
    }
  }
`;
