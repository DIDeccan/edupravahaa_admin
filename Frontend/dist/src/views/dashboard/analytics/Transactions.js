import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardBody, Table, Spinner, CardSubtitle } from "reactstrap";
import { fetchTransactionsReport } from "../../../redux/analyticsSlice";


const Transactions = () => {
  const dispatch = useDispatch();

  // Destructure from dashboard slice
  const { transactions = [], loadingTransactions, errorTransactions } = useSelector(
    (state) => state.dashboard || {}
  );

  // Fetch transactions on mount
  useEffect(() => {
    dispatch(fetchTransactionsReport());
  }, [dispatch]);
  // console.log("transactions",transactions)

  return (
    <Card>
      <CardHeader>
        <CardSubtitle className="text-muted mb-25">Analytics</CardSubtitle>
        <CardTitle tag="h4">Transaction Report (Last 5)</CardTitle>
      </CardHeader>
      <CardBody>
        {loadingTransactions ? (
          <div className="text-center">
            <Spinner color="primary" />
          </div>
        ) : errorTransactions ? (
          <p className="text-danger">{errorTransactions}</p>
        ) : transactions.length === 0 ? (
          <p>No transactions available.</p>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Payment Mode</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((txn, idx) => (
                <tr key={idx}>
                  <td>{txn.payment_mode}</td>
                  <td>{new Date(txn.date).toLocaleDateString()}</td>
                  <td>{txn.status}</td>
                  <td>₹{txn.amount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};

export default Transactions;
