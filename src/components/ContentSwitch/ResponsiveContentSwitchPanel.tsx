import * as React from 'react';
import { TabControlItem } from '../TabControl';
import { StandardProps } from '../../common';
import { withResponsive, ResponsiveComponentProps } from '../../hoc';
import { TabPageProps } from '../TabPage';
import { Container, Headers, Header, Content, ContentItem } from './ContentSwitch.part';
import { OverflowButton } from '../OverflowButton';
import { Icon } from '../Icon';

export type ContentSwitchOrientation = 'vertical' | 'horizontal';

export interface ContentSwitchProps extends StandardProps, ResponsiveComponentProps {
  items: Array<TabControlItem>;
  children?: void;
  /**
   * @default vertical
   */
  orientation?: ContentSwitchOrientation;
}

export interface ContentSwitchState {
  overflowItems: Array<TabControlItem>;
  items: Array<TabControlItem>;
}

const defaultOrientation = 'horizontal';
const overflowButtonWidth = 80;

class ContentSwitchInt extends React.Component<ContentSwitchProps, ContentSwitchState> {
  private headerNodesWidth: Array<number> = [];
  private container?: HTMLDivElement;
  private headers?: HTMLUListElement;

  constructor(props: ContentSwitchProps) {
    super(props);

    const { items } = props;

    this.state = {
      items,
      overflowItems: [],
    };
  }

  componentDidMount() {
    this.updateOverflow(this.state);
  }

  componentWillReceiveProps(prevProps: ContentSwitchProps) {
    const { orientation = defaultOrientation, items } = prevProps;
    const { container, headers } = this;

    if (container && headers && orientation === 'horizontal') {
      this.updateOverflow({ items, overflowItems: [] });
    } else {
      this.setState({
        items,
        overflowItems: [],
      });
    }
  }

  private updateOverflow(state: ContentSwitchState) {
    const { orientation = defaultOrientation } = this.props;
    const { items: stateItems } = state;
    const { container, headers, headerNodesWidth } = this;

    if (headers && container && orientation === 'horizontal') {
      if (!headerNodesWidth.length) {
        headers.childNodes.forEach((node: HTMLLIElement) => {
          headerNodesWidth.push(node.offsetWidth);
        });
      }

      const accItemsWidth = headerNodesWidth.reduce((acc, cur) => (acc += cur), 0);
      let visibleItemsWidth = overflowButtonWidth;

      if (accItemsWidth > container.offsetWidth) {
        const overflowItems: Array<TabControlItem> = [];
        const items: Array<TabControlItem> = [];

        headerNodesWidth.forEach((nodeWidth, index) => {
          visibleItemsWidth += nodeWidth;

          if (visibleItemsWidth < container.offsetWidth) {
            items.push(stateItems[index]);
          } else {
            overflowItems.push(stateItems[index]);
          }
        });

        this.setState({
          items,
          overflowItems,
        });
      }
    }
  }

  private setContainerRef = (ref: HTMLDivElement) => {
    if (this.container !== ref) {
      this.container = ref;
    }
  };

  private setHeadersRef = (ref: HTMLUListElement) => {
    if (this.headers !== ref) {
      this.headers = ref;
    }
  };

  private renderPages() {
    const { theme, items } = this.props;

    return items.map(({ element, active }, index) => (
      <ContentItem theme={theme} key={`item-${index}`} active={active}>
        {element}
      </ContentItem>
    ));
  }

  private renderHeaders() {
    const { theme, orientation = defaultOrientation } = this.props;
    const { items, overflowItems } = this.state;
    const headers: Array<React.ReactChild> = [];

    items.forEach((item, index) => {
      const element = item.element as React.ReactElement<TabPageProps>;

      if (element && React.isValidElement(element)) {
        const { header } = element.props;
        const active = item.active;

        headers.push(
          <Header theme={theme} key={`head-${index}`} active={active} onClick={item.onSelect} orientation={orientation}>
            {header}
          </Header>,
        );
      }
    });

    overflowItems.length &&
      headers.push(
        <OverflowButton
          key={'overflowButton'}
          group={overflowItems.map(({ element, onSelect }) => (
            <div onClick={onSelect}>{element && (element as React.ReactElement<TabPageProps>).props.header}</div>
          ))}
          toggleButton={
            <Header>
              <Icon name="MoreVert" />
            </Header>
          }
        />,
      );

    return headers;
  }

  render() {
    const { children, theme, orientation = defaultOrientation, ...rest } = this.props;

    return (
      <Container theme={theme} {...rest} innerRef={this.setContainerRef}>
        <Headers theme={theme} orientation={orientation} innerRef={this.setHeadersRef}>
          {this.renderHeaders()}
        </Headers>
        <Content theme={theme}>{this.renderPages()}</Content>
      </Container>
    );
  }
}

export const ResponsiveContentSwitch = withResponsive(ContentSwitchInt);
