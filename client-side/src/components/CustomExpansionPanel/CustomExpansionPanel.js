import React from "react";
import {
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Box,
  Table, TableBody, TableRow, TableCell
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import styles from "./CustomExpansionPanel.module.scss";

export const CustomExpansionPanel = ({ title, data, ...props}) => {
  return (
    <ExpansionPanel classes= {{root: styles.root, expanded: styles["expanded"]}} {...props}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {title}
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Box width={300}>
          <Table>
            <TableBody>
              {
                Object.keys(data).map( (key, ind) => {
                  return (
                    <TableRow key={`${key}-${ind}`}>
                      <TableCell align="left">
                        <Typography>{key}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography>{data[key]} DAI</Typography>
                      </TableCell>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        </Box>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default CustomExpansionPanel;
