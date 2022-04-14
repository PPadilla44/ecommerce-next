import { makeStyles } from "@material-ui/core"

const useStyles = makeStyles({
    navbar: {
        backgroundColor: '#203040',
        '& a': {
            color: '#ffffff',
            marginLeft: 0
        }
    },
    grow: {
        flexGrow: 1,
    },
    brand: {
        fontWeight: "bold",
        fontSize: "1.5rem"
    },
    main: {
        minHeight: '80vh'
    },
    footer: {
        marginTop: 10,
        textAlign: 'center'
    },
    section: {
        marginBottom: 10,
        marginTop: 10
    }
})

export default useStyles;