
            // If they have accepted jobs before
            return <tr key={i}>
              <Cell>
                <button className="text-secondary hover:text-primary cursor-pointer" onClick={() => handleView(job)}>
                  {job["Job_Request_Details.Request_Type:label"]}{job["Job_Request_Details.Request_Type:label"]!.length > 37 ? "..." : ""}
                </button>
              </Cell>
              <Cell>{moment(job.activity_date_time!).format('DD/MM/YYYY hh:mm A')}</Cell>
              <Cell><Status className={statusColor[status]}>{status}</Status></Cell>
              <Cell>{job.location}</Cell>
            </tr>
          })}
      </Body>
    </Table>
    {jobs && <PageNavigation page={page} pages={pages} limit={limit} array={jobs} previousPage={previousPage} nextPage={nextPage} />}
  </div>
}