import { Theme } from '@aws-amplify/ui-react-native';
import colors from './colors';

export const authTheme: Theme = {
    tokens: {
        colors: {
            font: {
                primary: colors.white,
                secondary: colors.detailsBackground,
                tertiary: colors.inactiveButtonColor,
            },
            background: {
                primary: colors.brandColor,
                // secondary: colors.white,
                // tertiary: colors.white,
                // quaternary: colors.white,
            },
        },
        fontSizes: {
            xl: '36px',
            medium: '18px',
        },
        fontWeights: {
            light: 300,
            normal: 400,
            bold: 700,
        },
        borderWidths: {
            small: 1,
        }
    },
    components: {
        button: {
            containerPrimary: {
                backgroundColor: colors.lightBrandColor,
                borderColor: colors.inactiveButtonColor,
                borderWidth: 1,
                borderRadius: 10,
            },
            textLink: {
                color: colors.white,
            }
        },
        errorMessage: {
            container: {
                backgroundColor: colors.lightBrandColor,
            },
            label: {
                color: colors.white,
            }
        },
        textField: {
            fieldContainer: {
                borderRadius: 20,
                borderColor: colors.white,
                borderWidth: 1,
                backgroundColor: colors.inactiveButtonColor,
            }
        }
    }
};