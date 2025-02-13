import styled, { css } from 'styled-components/native';

export const CreditsOrderContainer = styled.View`
  ${({ theme }) => css`
    align-items: center;
    margin: 10px 0;
    border-radius: 10px;

    padding: 15px 10px;
    background: ${theme.COLORS.GRAY_700};
    border: solid 1px ${theme.COLORS.GRAY_500};
  `}
`;

export const InfoContainer = styled.View`
  flex: 1;
  align-items: center;
`;

export const PlateText = styled.Text`
  ${({ theme }) => css`
    font-family: ${theme.FONTS.BOLD};
    font-size: ${theme.FONT_SIZE.XXLG};
    color: ${theme.COLORS.GRAY_100};
  `}
`;

export const DateText = styled.Text`
  ${({ theme }) => css`
    font-family: ${theme.FONTS.BOLD};
    font-size: ${theme.FONT_SIZE.MD};
    color: ${theme.COLORS.GRAY_300};
  `}
`;

export const StatusContainer = styled.View`
  margin-top: 5px;
  align-items: center;
  flex-direction: row;
`;

interface StatusTextStyle {
  color: 'green' | 'yellow' | 'red';
}

const STATUS_COLOR = {
  green: 'GREEN_500',
  yellow: 'YELLOW_500',
  red: 'RED_500',
} as const;

export const StatusText = styled.Text<StatusTextStyle>`
  ${({ theme, color }) => css`
    margin-left: 10px;

    font-family: ${theme.FONTS.BOLD};
    font-size: ${theme.FONT_SIZE.LG};
    color: ${theme.COLORS[STATUS_COLOR[color]]};
  `}
`;
