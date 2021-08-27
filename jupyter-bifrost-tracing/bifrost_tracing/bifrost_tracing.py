"""Main module."""
from IPython import get_ipython
from IPython.core.magic import Magics, magics_class, cell_magic, line_magic
from IPython.core.extensions import ExtensionManager
from IPython import get_ipython

import ast


# keep it here for reactive cells later??
@magics_class
class BifrostTracing(Magics):
    @line_magic
    def line_tracing(self, line):
        return line

    @cell_magic
    def tracing(self, line, cell):
        return line, cell


class BifrostWatcher(object):
    def __init__(self, ip):
        self.shell = ip
        self.last_x = None
        self.bifrost_table = {}
        self.plot_output = ""
        self.bifrost_input = ""
        self.bifrost_input_url = ""
        self.chart_var = ""
        self.visitor = None

    def pre_run_cell(self, info):
        ast_tree = ast.parse(info.raw_cell)
        assignVisitor = AssignVisitor(self.chart_var)
        assignVisitor.visit(ast_tree)
        output_var = assignVisitor.output_var
        bifrost_input = assignVisitor.bifrost_input
        bifrost_input_url = assignVisitor.bifrost_input_url
        chart_var = assignVisitor.chart_var
        if chart_var:
            self.chart_var = chart_var
        if output_var:
            self.plot_output = output_var
        if bifrost_input:
            self.bifrost_input = bifrost_input
            self.bifrost_input_url = ""
        elif bifrost_input_url:
            self.bifrost_input = ""
            self.bifrost_input_url = bifrost_input_url
        self.visitor = assignVisitor
        # print(self.plot_output)
        # print(self.bifrost_input)
        # print(self.bifrost_input_url)

    def post_run_cell(self, result):
        if not result.error_in_exec:
            ast_tree = ast.parse(result.info.raw_cell)

            callVisitor = CallVisitor()
            callVisitor.visit(ast_tree)
            # print(f"args={callVisitor.args}")

            for arg in callVisitor.args:
                key, value = arg.split(".")
                if key in self.bifrost_table and value in self.bifrost_table[key]:
                    self.bifrost_table[key][value] = self.bifrost_table[key][value] + 1
                elif key in self.bifrost_table and value not in self.bifrost_table[key]:
                    self.bifrost_table[key][value] = 1
                else:
                    self.bifrost_table[key] = {value: 1}


class AttributeVisitor(ast.NodeVisitor):
    def __init__(self):
        self.attributes = []

    def visit_Attribute(self, node):
        if isinstance(node, ast.Attribute):
            self.visit(node.value)
            if isinstance(node.value, ast.Name):
                self.attributes.append(node.attr)
            elif isinstance(node.value, ast.Call):
                callVisitor = CallVisitor()
                callVisitor.visit(node.value)


class NameVisitor(ast.NodeVisitor):
    def __init__(self):
        self.names = []

    def visit_Name(self, node):
        self.names.append(node.id)


class AssignVisitor(ast.NodeVisitor):
    def __init__(self, chart_var):
        self.new_dfs = set()
        self.output_var = None
        self.bifrost_input = None
        self.bifrost_input_url = None
        self.chart_var = chart_var

    def visit_Module(self, node):
        self.generic_visit(node)

    def visit_Assign(self, node):
        nameVisitor = NameVisitor()
        for target in node.targets:
            nameVisitor.visit(target)
        names = nameVisitor.names
        attributeVisitor = AttributeVisitor()
        attributeVisitor.visit(node.value)
        attributes = ".".join(attributeVisitor.attributes)
        # df_mask = "pd.DataFrame" in attributes
        # plot_mask = "bifrost.plot" in attributes
        if "DataFrame" in attributes:
            self.new_dfs.add(*names)

        if (
            isinstance(node.value, ast.Call)
            and isinstance(node.value.func, ast.Name)
            and node.value.func.id == "Chart"
        ):
            self.chart_var = node.targets[0].id
            if isinstance(node.value.args[0], ast.Constant):
                self.bifrost_input_url = node.value.args[0].value
            elif isinstance(node.value.args[0], ast.Name):
                self.bifrost_input = node.value.args[0].id
        if (
            isinstance(node.value, ast.Call)
            and isinstance(node.value.func, ast.Attribute)
            and isinstance(node.value.func.value, ast.Name)
            and node.value.func.value.id == self.chart_var
            and "plot" in attributes
        ):
            self.output_var = names[-1] if len(names) else None


class SubscriptVisitor(ast.NodeVisitor):
    def visit_Subscript(self, node: ast.Subscript):
        self.subscripts = []
        if isinstance(node.slice, ast.Tuple):
            columns = [element.value for element in node.slice.elts]
            for column in columns:
                self.subscripts.append[[node.value.id, column]]
        elif isinstance(node.slice, ast.Compare):
            left = node.slice.left
            if isinstance(left, ast.Subscript):
                self.visit_Subscript(left)
            else:
                self.subscripts.append([left.value.id, left.attr])
        elif isinstance(node.value, ast.Name) and isinstance(node.slice, ast.Constant):
            self.subscripts.append([node.value.id, node.slice.value])


class CallVisitor(ast.NodeVisitor):
    def __init__(self):
        self.args = []

    def visit_Module(self, node):
        self.generic_visit(node)

    def visit_Assign(self, node):
        if isinstance(node.targets[0], ast.Subscript):
            self.get_args(node.targets[0])

    def visit_Expr(self, node):
        if isinstance(node.value, ast.Call):
            self.visit_Call(node.value)
        elif isinstance(node.value, ast.Subscript):
            self.get_args(node.value)
        elif isinstance(node.value, ast.Attribute):
            if isinstance(node.value.value, ast.Name):
                self.get_args(node.value.attr, node.value.value.id)
            elif isinstance(node.value.value, ast.Subscript):
                self.get_args(node.value.value)

    def visit_Call(self, node):
        attributeVisitor = AttributeVisitor()
        if not isinstance(node.func, ast.Attribute):
            return
        if isinstance(node.func.value, ast.Subscript):
            self.get_args(node.func.value)
        elif isinstance(node.func.value, ast.Name):
            func = node.func.value.id
            # NP case
            if func in ["np", "numpy"]:
                attributeVisitor.visit(node.func)
                if attributeVisitor.attributes[0] in ["mean", "std", "sum"]:
                    args = node.args
                    if len(args) != 0:
                        self.get_args(args[0])
                    else:
                        # check keywords
                        keywords = node.keywords
                        for keyword in keywords:
                            if keyword.arg == "a":
                                self.get_args(keyword.value)
            # DF/PD case
            elif func in ["df", "pd"]:
                attributeVisitor.visit(node.func)
                attribute = attributeVisitor.attributes[0]
                if attribute in [
                    "groupby",
                    "loc",
                    "iloc",
                ]:
                    args = node.args
                    if len(args) != 0:
                        if isinstance(node.func.value, ast.Name):
                            self.get_args(args[0], node.func.value.id)
                        else:
                            self.get_args(args[0])
                    else:
                        # check keywords
                        keywords = node.keywords
                        for keyword in keywords:
                            if attribute == "groupby" and keyword.arg == "by":
                                self.get_args(keyword.value)

    """value: either ast.Subscript or ast.Attribute"""

    def get_args(self, value, dataframe=None):
        # case arg is df['one']
        if isinstance(value, ast.Subscript):
            subscriptVisitor = SubscriptVisitor()
            subscriptVisitor.visit(value)
            if len(subscriptVisitor.subscripts) != 0:
                self.args.append(
                    f"{subscriptVisitor.subscripts[0][0]}.{subscriptVisitor.subscripts[0][1]}"
                )

        # case arg is df.one
        elif isinstance(value, ast.Attribute):
            attributeVisitor = AttributeVisitor()
            nameVisitor = NameVisitor()
            attributeVisitor.visit(value)
            nameVisitor.visit(value.value)
            df = nameVisitor.names[0]
            column = attributeVisitor.attributes[0]
            self.args.append(f"{df}.{column}")
        elif isinstance(value, ast.List):
            columns = [element.value for element in value.elts]
            if dataframe:
                for column in columns:
                    self.args.append(f"{dataframe}.{column}")
        elif isinstance(value, ast.Constant):
            if dataframe:
                self.args.append(f"{dataframe}.{value.value}")


# some_var = ...bifrost.plot()
def isnotebook():
    try:
        shell = get_ipython().__class__.__name__
        if shell == "ZMQInteractiveShell":
            return True  # Jupyter notebook or qtconsole
        elif shell == "TerminalInteractiveShell":
            return False  # Terminal running IPython
        else:
            return False  # Other type (?)
    except NameError:
        return False  # Probably standard Python interpreter


def load_ipython_extension(ipython):
    ipython.register_magics(BifrostTracing)
    vw = BifrostWatcher(ipython)
    ipython.events.register("pre_run_cell", vw.pre_run_cell)
    ipython.events.register("post_run_cell", vw.post_run_cell)
    return vw


Watcher = load_ipython_extension(get_ipython())
