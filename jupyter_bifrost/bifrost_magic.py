from IPython.core.magic import Magics, magics_class, line_magic, cell_magic


@magics_class
class Abracadabra(Magics):
    @line_magic
    def abra(self, line):
        return line

    @cell_magic
    def cadabra(self, line, cell):
        return line, cell
