import VegaPandasTranslator from '../modules/VegaPandasTranslator';
import { createGraphSpec } from './utils';

describe('Vega Pandas Translator', () => {
  const translator = new VegaPandasTranslator();

  it('Should output the dataframe variable name when there are no transforms present', () => {
    const basicSpec: any = createGraphSpec();
    expect(translator.convertSpecToCode(basicSpec)).toEqual(
      "temp = pd.read_csv('')"
    );
  });
  it('Should convert range filters to Pandas queries', () => {
    const basicSpec: any = createGraphSpec({
      transform: [
        {
          filter: {
            or: [
              {
                field: 'field',
                range: [3.3, 4],
              },
            ],
          },
        },
      ],
    });

    const code = translator.convertSpecToCode(basicSpec);
    expect(code).toEqual(
      "temp = pd.read_csv('')\ntemp[(temp['field'] >= 3.3) & (temp['field'] <= 4)]"
    );
  });

  it('Should convert categorical filters to Pandas queries', () => {
    const spec: any = createGraphSpec({
      transform: [
        {
          filter: {
            field: 'class',
            oneOf: ['iris_setosa'],
          },
        },
      ],
    });

    const code = translator.convertSpecToCode(spec);
    expect(code).toEqual(
      "temp = pd.read_csv('')\ntemp[(temp['class'].isin([\"iris_setosa\"]))]"
    );
  });

  it('Should be able to handle compound filter statements', () => {
    const spec: any = createGraphSpec({
      transform: [
        {
          filter: {
            field: 'class',
            oneOf: ['iris_setosa', 'iris_versicolour'],
          },
        },
        {
          filter: {
            or: [
              {
                field: 'sepal length (cm)',
                range: [5, 7.9],
              },
            ],
          },
        },
      ],
    });

    const code = translator.convertSpecToCode(spec);
    expect(code).toEqual(
      "temp = pd.read_csv('')\ntemp[(temp['class'].isin([\"iris_setosa\",\"iris_versicolour\"]))&(temp['sepal length (cm)'] >= 5) & (temp['sepal length (cm)'] <= 7.9)]"
    );
  });
});
